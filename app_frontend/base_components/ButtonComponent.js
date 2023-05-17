import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import styles from '../styles';

export const ButtonComponent = ({ title, onPress, style, icon }) => {
    return (
        <TouchableOpacity style={[buttonStyles.button, style]} onPress={onPress}>
            {icon ? (
                <Image source={icon} style={buttonStyles.icon} />
            ) : (
                <Text style={buttonStyles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const buttonStyles = StyleSheet.create({
    button: {
        backgroundColor: styles.appTheme.backgroundColor,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    icon: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
    },
});
