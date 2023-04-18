import { StyleSheet } from 'react-native';

const statusBarHeight = 20;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreen: {
    height: '100%',
    width: '100%'
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    padding: 10,
    paddingTop: statusBarHeight,
  },
  toolbarButtonLeft: {
    paddingLeft: 10,
  },
  toolbarButtonRight: {
    paddingRight: 10,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  toolbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },




  // Map
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

});

export default styles;
