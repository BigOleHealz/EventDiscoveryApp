import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import styles from '../styles';

export const Toolbar = ({ onLeftButtonClick, onRightButtonClick }) => (
    <View style={toolbar_styles.toolbar}>
        <TouchableOpacity style={toolbar_styles.toolbarButtonLeft} onPress={onLeftButtonClick}>
            <Text style={toolbar_styles.toolbarButtonText}>Find Games</Text>
        </TouchableOpacity>
        <TouchableOpacity id="create-game-button" style={toolbar_styles.toolbarButtonRight} onPress={onRightButtonClick}>
            <Text style={toolbar_styles.toolbarButtonText}>Create Game</Text>
        </TouchableOpacity>
    </View>
);

const toolbar_styles = StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: styles.appTheme.backgroundColor,
        padding: 10,
        paddingTop: 20,
    },
    toolbarButtonLeft: {
        paddingLeft: 10,
    },
    toolbarButtonRight: {
        paddingRight: 10,
    },
    toolbarButtonText: {
        color: styles.appTheme.color,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
