import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  appTheme: {
    backgroundColor: '#333',
    color: '#ddd'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreen: {
    flex: 1
  },
  timeSliderView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttons: {
    menu_button_styles: {
      backgroundColor: '#2196F3',
      width: '100%',
      margin: 16
    }
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
  }

});

export default styles;
