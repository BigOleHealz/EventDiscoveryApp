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
  panelsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
    
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow styles for elevation
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  leftPanel: {
    left: 0,
  },
  rightPanel: {
    right: 0,
  },
  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

});

export default styles;
