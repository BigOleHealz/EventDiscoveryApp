import { StyleSheet } from 'react-native';

const defaultBackgroundColor = '#333333';
const defaultFontColor = '#ffffff';
const defaultPadding = 10;
const defaultMargin = 10;
const defaultBorderRadius = 8;

const styles = StyleSheet.create({
  appTheme: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    padding: defaultPadding,
    // borderRadius: defaultBorderRadius,
  },
  container: {
    flex: 1,
    padding: defaultPadding,
    backgroundColor: defaultBackgroundColor,
  },
  fullScreen: {
    flex: 1,
  },
  timeSliderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text_component: {
    color: defaultFontColor,
  },
  buttons: {
    standardButton: {
      paddingLeft: defaultPadding,
      paddingRight: defaultPadding,
      paddingTop: 5,
      paddingBottom: 5,
      borderRadius: defaultBorderRadius,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menu_button_styles: {
      backgroundColor: '#2196F3',
      height: 50,
    },
    clear_button_styles: {
      backgroundColor: defaultBackgroundColor,
    },
    button_text: {
      color: defaultFontColor,
      fontSize: 20,
      fontWeight: 'bold',
    },
  },
  authContainer: {
    width: '60%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  h1: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  h2: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
  h3: {
    width: '100%',
    fontSize: 20,
    margin: 12,
  },
  h4: {
    width: '100%',
    fontSize: 16,
    margin: 10,
  },
  h5: {
    width: '100%',
    fontSize: 14,
    margin: 8,
  },
  h6: {
    width: '100%',
    fontSize: 12,
    margin: 6,
  },
  hyperlinkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

export default styles;
