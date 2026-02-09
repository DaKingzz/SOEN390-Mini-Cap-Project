import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import {
  requestGoogleCalendars,
  requestGoogleLogout,
  requestGoogleOAuthExchange,
  requestGoogleState,
  requestSetGoogleSelectedCalendar,
} from "../api/googleCalendarApi";

export default function UpcomingEventButton() {
  const googleWebClientId = (Constants.expoConfig?.extra as any)?.GOOGLE_WEB_CLIENT_ID as string | undefined;
  const [selectedCalendar, setSelectedCalendar] = useState<any | null>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [nextEvent, setNextEvent] = useState<any | null>(null);
  const [eventDetailsText, setEventDetailsText] = useState<string>("");
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const clearLocalGoogleState = () => {
    setSelectedCalendar(null);
    setCalendars([]);
    setShowCalendarPicker(false);
    setNextEvent(null);
    setEventDetailsText("");
    setShowEventDetails(false);
  };

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      webClientId: googleWebClientId,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  useEffect(() => {
    void refreshState(false, false);
  }, []);

  const exchangeNewSession = async (options?: { showPickerAfterSignIn?: boolean }): Promise<void> => {
    if (!googleWebClientId) {
      throw new Error("GOOGLE_WEB_CLIENT_ID is missing in app config.");
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();

    const code = (userInfo as any)?.serverAuthCode ?? (userInfo as any)?.data?.serverAuthCode;
    if (!code) throw new Error("No serverAuthCode returned.");

    if (options?.showPickerAfterSignIn) {
      setCalendars([]);
      setShowCalendarPicker(true);
      setIsCalendarLoading(true);
    }

    const exchangeRes = await requestGoogleOAuthExchange(code);

    if (!exchangeRes.ok) {
      throw new Error(await exchangeRes.text());
    }
  };

  const refreshState = async (
    allowReauth = false,
    includeCalendars = false,
    reauthOptions?: { showPickerAfterSignIn?: boolean }
  ): Promise<any | null> => {
    try {
      let stateRes = await requestGoogleState(includeCalendars);

      if (!stateRes.ok && (stateRes.status === 400 || stateRes.status === 401 || stateRes.status === 403)) {
        if (!allowReauth) {
          await clearLocalGoogleState();
          return null;
        }

        await exchangeNewSession(reauthOptions);
        stateRes = await requestGoogleState(includeCalendars);
      }

      if (!stateRes.ok) {
        throw new Error(await stateRes.text());
      }

      const state = await stateRes.json();
      const selected = state?.selectedCalendar && state.selectedCalendar.id ? state.selectedCalendar : null;
      setSelectedCalendar(selected);
      const detailsTextFromBackend =
        typeof state?.nextEventDetailsText === "string" ? state.nextEventDetailsText : null;

      if (state?.nextEvent && typeof state.nextEvent === "object") {
        setNextEvent(state.nextEvent);
        setEventDetailsText(detailsTextFromBackend ?? "No event details available.");
      } else {
        setNextEvent(null);
        setEventDetailsText(detailsTextFromBackend ?? "No upcoming events found in the next 7 days.");
      }

      return state;
    } catch (e: any) {
      console.log("STATE REFRESH ERROR:", e);
      return null;
    }
  };

  const fetchCalendarsWithReauth = async (): Promise<any[]> => {
    let res = await requestGoogleCalendars();

    if (!res.ok && (res.status === 400 || res.status === 401 || res.status === 403)) {
      await exchangeNewSession();
      res = await requestGoogleCalendars();
    }

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const calendarsData = await res.json();
    return Array.isArray(calendarsData) ? calendarsData : [];
  };

  const startImportFlow = async (forceCalendarPicker = false) => {
    setIsBusy(true);
    try {
      const state = await refreshState(true, false, { showPickerAfterSignIn: true });
      if (!forceCalendarPicker && state?.calendarSelected) {
        setShowCalendarPicker(false);
        return;
      }

      if (!showCalendarPicker) {
        setCalendars([]);
        setShowCalendarPicker(true);
        setIsCalendarLoading(true);
      }

      const loadedCalendars = await fetchCalendarsWithReauth();
      setCalendars(loadedCalendars);
    } catch (e: any) {
      console.log("IMPORT FLOW ERROR:", e);
    } finally {
      setIsCalendarLoading(false);
      setIsBusy(false);
    }
  };

  const selectCalendarAndRefresh = async (calendar: any): Promise<boolean> => {
    setIsBusy(true);
    try {
      if (!calendar?.id) throw new Error("Missing calendar id.");

      let setRes = await requestSetGoogleSelectedCalendar({
        id: calendar.id,
        summary: calendar.summary,
        primary: !!calendar.primary,
      });

      if (!setRes.ok && (setRes.status === 400 || setRes.status === 401 || setRes.status === 403)) {
        await exchangeNewSession();
        setRes = await requestSetGoogleSelectedCalendar({
          id: calendar.id,
          summary: calendar.summary,
          primary: !!calendar.primary,
        });
      }

      if (!setRes.ok) {
        throw new Error(await setRes.text());
      }

      const state = await refreshState(false, false);
      return !!state?.calendarSelected;
    } catch (e: any) {
      console.log("SELECT CALENDAR ERROR:", e);
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (!selectedCalendar?.id) {
      return;
    }

    const intervalId = setInterval(() => {
      if (AppState.currentState === "active") {
        void refreshState(false, false);
      }
    }, 60_000);

    const appStateSub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        void refreshState(false, false);
      }
    });

    return () => {
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [selectedCalendar?.id]);

  const logoutGoogleForTesting = async () => {
    try {
      try {
        await requestGoogleLogout();
      } catch {}
      await clearLocalGoogleState();
      try {
        await GoogleSignin.revokeAccess();
      } catch {}
      try {
        await GoogleSignin.signOut();
      } catch {}
    } catch (e: any) {
      console.log("LOGOUT ERROR:", e);
    }
  };

  const showRedEventButton = !!selectedCalendar;
  const upcomingTitle = nextEvent ? ((nextEvent?.summary ?? "").trim() || "Upcoming event") : "No event in calendar";

  return (
    <View style={{ width: "100%" }}>
      {!showRedEventButton ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (!isBusy) void startImportFlow();
          }}
        >
          <Text style={styles.primaryBtnText}>Import schedule from Google Calendar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.upcomingBtn} onPress={() => setShowEventDetails(true)}>
          <Text style={styles.upcomingBtnText}>Upcoming event: {upcomingTitle}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showCalendarPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a calendar</Text>

            {isCalendarLoading ? (
              <View style={styles.calendarLoadingBox}>
                <ActivityIndicator size="small" color="#1976d2" />
                <Text style={styles.calendarLoadingText}>Refreshing calendars...</Text>
              </View>
            ) : (
              <FlatList
                data={calendars}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.calendarRow}
                    onPress={async () => {
                      setShowCalendarPicker(false);
                      await selectCalendarAndRefresh(item);
                    }}
                  >
                    <Text style={styles.calendarName}>{item.summary}</Text>
                    {item.primary ? <Text style={styles.calendarMeta}>Primary</Text> : null}
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={{ height: 12 }} />
            <Button title="Cancel" onPress={() => setShowCalendarPicker(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={showEventDetails} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{upcomingTitle}</Text>
              <TouchableOpacity
                style={styles.detailsCloseBtn}
                onPress={() => setShowEventDetails(false)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={styles.detailsCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.detailsBody}>{eventDetailsText}</Text>

            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={styles.changeCalendarBtn}
              onPress={() => {
                setShowEventDetails(false);
                void startImportFlow(true);
              }}
            >
              <Text style={styles.changeCalendarBtnText}>Change calendar</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity style={styles.logoutBtn} onPress={logoutGoogleForTesting}>
              <Text style={styles.logoutBtnText}>Log out of Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#1976d2",
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  upcomingBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#c62828",
    backgroundColor: "white",
    alignItems: "center",
    width: "100%",
  },
  upcomingBtnText: {
    color: "#c62828",
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  calendarLoadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  calendarLoadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
  },
  calendarRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  calendarName: {
    fontSize: 16,
  },
  calendarMeta: {
    fontSize: 12,
    opacity: 0.7,
  },

  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  detailsHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailsCloseBtn: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCloseText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#444",
  },
  detailsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  detailsBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  changeCalendarBtn: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  changeCalendarBtnText: {
    color: "white",
    fontWeight: "700",
  },
  logoutBtn: {
    backgroundColor: "#c62828",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "white",
    fontWeight: "700",
  },
});
