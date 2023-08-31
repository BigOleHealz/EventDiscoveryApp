import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const defaultBackgroundColor = '#333333';
const defaultFontColor = '#ffffff';
const defaultPadding = 10;
const defaultMargin = 10;
const defaultBorderRadius = 8;

const brightBlueColor = '#2196F3'


export const common_styles = StyleSheet.create({
  appTheme: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    padding: defaultPadding,
  },
  container: {
    flex: 1,
    padding: defaultPadding,
    backgroundColor: defaultBackgroundColor,
  },
  fullScreen: {
    flex: 1,
  },
  h1: {
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
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
    color: brightBlueColor,
    textDecorationLine: 'underline',
  },
});

export const create_account_styles = StyleSheet.create({
  container: {
    ...common_styles.appTheme,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16
  },
  loginLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

export const button_styles = StyleSheet.create({
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
    backgroundColor: brightBlueColor,
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
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
});

export const calendar_styles = StyleSheet.create({
  view: {
    padding: common_styles.appTheme.padding,
    width: '100%',
  },
  theme: {
    backgroundColor: '#222222',
    calendarBackground: '#222222',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#ddd',
    textDisabledColor: '#888',
    monthTextColor: '#ddd'
  },
  arrowStyle: {
    width: 20,
    height: 20,
  }
});

export const login_page_styles = StyleSheet.create({
  authContainer: {
    width: '60%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    ...common_styles.appTheme,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  title: common_styles.h1,
  label: {
    width: '100%',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  forgotPassword: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  hyperlinkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  createAccount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  }
});

export const map_styles = StyleSheet.create({
  mapContainerStyle: {
    flex: 1,
    width: '100%',
  },
  pinStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -100%)',
  },
  logoutButtonStyle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '20%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const modal_component_styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '80%',
    width: '40%',
    flexDirection: 'column',  // make sure the flex direction is column
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: common_styles.appTheme.backgroundColor,
    borderRadius: 10,
		overflow: 'hidden'
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(96, 96, 96, 0.5)',
    padding: 10,
    margin: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: common_styles.appTheme.color,
  },
  submit_button_container: {
    borderTopWidth: 1,
    borderColor: 'rgba(96, 96, 96, 0.5)',
    padding: 10,
    margin: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1, 
    width: '100%',
  }
});

export const modal_styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: common_styles.appTheme.color,
  },
  buttonStyle: {
    marginBottom: 20,
    backgroundColor: brightBlueColor,
  },
  scrollView: {
    marginLeft: 20,
    marginRight: 20,
  },
  textInputStyle: {
    margin: 20,
  },
  componentStyle: {
    width: '100%',
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export const select_interests_scrollview_styles = StyleSheet.create({
  parentContainer: {
    paddingTop: 20,
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  switchLabel: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: common_styles.appTheme.color,
  },
  buttonStyle: {
    marginBottom: 20,
    backgroundColor: '#2196F3',
  },
  scrollView: {
    margin: 20,
    shadowColor: '#000',
		shadowOffset: {
			width: 10,
			height: 10,
		},
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 5,
  },
});

export const side_panel_styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: windowWidth > 800 ? '30%' : '100%',
    backgroundColor: common_styles.appTheme.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  }
});

export const text_component_styles = StyleSheet.create({
  view: {
    color: common_styles.appTheme.color,
    padding: common_styles.appTheme.padding
  }
});

export const text_input_styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    padding: 0,
    margin: 10
  },
  input: {
    fontSize: 16,
    height: 40,
    color: common_styles.appTheme.color,
    borderColor: 'rgba(0, 0, 0, 0)', // Set border color to transparent to avoid overlapping
    outlineWidth: 0, // Remove outline 
  },
});

export const time_range_slider_styles = StyleSheet.create({
  view: {
    padding: 20,
  },
  text: {
    color: common_styles.appTheme.color
  },
  timeSliderView: {
    padding: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export const toolbar_styles = StyleSheet.create({
  toolbar: {
    ...common_styles.appTheme,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: styles.appTheme.backgroundColor,
    padding: 15,
  },
  toolbarComponent: {
    height: '100%',
  },
  toolbarButtonLeft: {
    paddingLeft: 10,
  },
  toolbarButtonRight: {
    paddingRight: 10,
  },
  centerView: {
    flex: 1,
    alignItems: 'center',
  },
  centeredButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerButton: {
    paddingHorizontal: 10,
  },
  icon: {
    height: 35,
    width: 35
  }
});

export const tooltip_styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#222', // Dark background color
    color: '#fff', // Light text color
    padding: 10, // Add padding for better appearance
    borderRadius: '4px', // Add border radius for a smoother look
    margin: 0,
  },
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    width: '100%',
  },
  title: {
    // fontWeight: 'bold',
    // textAlign: 'center',
    // justifyContent: 'center',
    ...common_styles.h1,
  },
  label: {
    width: '30%',
    fontWeight: '600',
    marginRight: 4,
    paddingLeft: 4,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: 'right',
  },
  value: {
    padding: 2,
  },
  buttonStyle: {
    backgroundColor: '#2196F3',
  },
  infoWindowStyle: {
    padding: 0,
    margin: 0,
  },
});

export const top_panel_styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: '20%',
		right: '20%',
		backgroundColor: common_styles.appTheme.backgroundColor,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 10,
			height: 10,
		},
		width: '60%',
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 5,
		zIndex: 10,
		overflow: 'hidden',
	},
})