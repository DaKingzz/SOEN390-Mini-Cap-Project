import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "SEARCH_HISTORY";
const MAX_HISTORY = 10;

export type SearchHistoryItem = {
  query: string;
  timestamp: number;
};

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
}

export async function addSearchHistory(query: string) {
  const history = await getSearchHistory();

  // Remove duplicate of same query
  const filtered = history.filter((item) => item.query !== query);

  // Add new entry
  const newHistory = [
    { query, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_HISTORY);

  await AsyncStorage.setItem(KEY, JSON.stringify(newHistory));
}
