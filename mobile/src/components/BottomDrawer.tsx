import {useEffect, useMemo, useRef, ReactNode} from "react";
import {BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {StyleSheet, TouchableOpacity, View, ViewStyle} from "react-native";

interface BottomDrawerProps {
    visible: boolean;
    onClose: () => void;
    children: ReactNode;
    snapPoints?: string[] | number[];
    initialSnapIndex?: number;
    backgroundColor?: string;
    handleColor?: string;
    enablePanDownToClose?: boolean;
    enableDynamicSizing?: boolean;
    contentContainerStyle?: ViewStyle;
}

export default function BottomDrawer({
                                         visible,
                                         onClose,
                                         children,
                                         snapPoints = ['50%', '75%'],
                                         initialSnapIndex = 0,
                                         backgroundColor = '#FFFFFF',
                                         handleColor = '#00000040',
                                         enablePanDownToClose = true,
                                         enableDynamicSizing = false,
                                         contentContainerStyle,
                                     }: BottomDrawerProps) {
    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const CustomHandle = ({onPress}: { onPress: () => void }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={[styles.handleWrapper, {backgroundColor}]}
            >
                <View style={[styles.handleIndicator, {backgroundColor: handleColor}]}/>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={memoizedSnapPoints}
            index={initialSnapIndex}
            enableDynamicSizing={enableDynamicSizing}
            enablePanDownToClose={enablePanDownToClose}
            onDismiss={onClose}
            backgroundStyle={[styles.background, { backgroundColor }]}
            handleComponent={() => (
                <CustomHandle onPress={() => bottomSheetRef.current?.dismiss()}/>
            )}
        >
            <BottomSheetView style={[styles.contentContainer, contentContainerStyle]}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    background: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -5, // Small negative value to show above the sheet
        },
        shadowOpacity: 0.99,
        shadowRadius: 10,
        elevation: 10,
    },
    contentContainer: {
        padding: 36,
        alignItems: 'center',
    },
    handleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    handleIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
});