// Assuming you might need windowWidth, using window.innerWidth for web
const windowWidth = window.innerWidth;

const defaultBackgroundColor = '#333333';
const defaultFontColor = '#ffffff';
const defaultPadding = 10;
const defaultMargin = 10;
const defaultBorderRadius = 8;
const brightBlueColor = '#2196F3';

const toolbar_height = 6;
const display_container_top = 100 - toolbar_height;

export const common_styles = {
  appTheme: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    padding: `${defaultPadding}px`,
  },
  container: {
    display: 'flex',
    flex: '1',
    // padding: `${defaultPadding}px`,
    padding: '0',
    backgroundColor: defaultBackgroundColor,
  },
  fullScreen: {
    flex: '1',
  },
  h1: {
    width: '100%',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  h2: {
    width: '100%',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: `${defaultMargin}px`,
    textAlign: 'center',
  },
  h3: {
    width: '100%',
    fontSize: '20px',
    margin: '12px',
  },
  h4: {
    width: '100%',
    fontSize: '16px',
    margin: '10px',
  },
  h5: {
    width: '100%',
    fontSize: '14px',
    margin: '8px',
  },
  h6: {
    width: '100%',
    fontSize: '12px',
    margin: '6px',
  },
  hyperlinkText: {
    color: brightBlueColor,
    textDecoration: 'underline',
  },
};

export const login_page_styles = {
  authContainer: {
    width: '60%',
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalContainer: {
    ...common_styles.appTheme,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...common_styles.h1,
    margin: '10px auto',
  },
  label: {
    width: '100%',
    fontSize: '16px',
    marginBottom: '8px',
  },
  input: {
    border: '1px solid gray',
    borderRadius: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    marginBottom: '16px',
  },

  forgotPassword: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '16px',
  },
  hyperlinkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  createAccount: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '16px',
  }
};

export const create_account_styles = {
  container: {
    ...common_styles.appTheme,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
  },
  loginLinkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '16px'
  },
  loginLink: {
    color: '#2196F3',
    textDecoration: 'underline',
  },
};

export const button_styles = {
  standardButton: {
    height: '100%',
    borderColor: 'rgba(0, 0, 0, 0.0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu_button_styles: {
    backgroundColor: brightBlueColor,
    borderRadius: defaultBorderRadius,
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clear_button_styles: {
    backgroundColor: defaultBackgroundColor,
  },
  button_text: {
    color: defaultFontColor,
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '10px 10px',
  },
  icon: {
    height: '30px',
    width: '30px',
  },
};

export const calendar_styles = {
  view: {
    boxSizing: 'border-box',
    padding: '10px',
    overflowX: 'hidden', // Prevent horizontal overflow
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
  }
};

const select_event_location_styles = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '20%',
  height: '50px',
  borderRadius: '8px',
  display: 'flex'
};


export const create_event_location_selector_styles = {
  verticalContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: `${defaultPadding}px`,
    // height: `${display_container_top}vh`
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input_location_text_component_styles: {
    position: 'relative',
    // left: '50%',
    // transform: 'translateX(-50%)',
    width: '20%',
    height: '50px',
    borderRadius: '8px',
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    margin: '10px auto',
    padding: '10px auto',
    // ...select_event_location_styles,
    top: '20px'
  },
  pinStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -100%)',
  },
  submitCoordinatesButtonStyle: {
    ...button_styles.menu_button_styles,
    ...select_event_location_styles,
    color: defaultFontColor,
    bottom: '20px',
  }
};

export const map_styles = {
  mapContainerStyle: {
    display: 'flex',
    width: '100vw',
    height: `${display_container_top}vh`,
    flexDirection: 'column',
  },
  logoutButtonStyle: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: '20%',
    height: '50px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: defaultFontColor
  }
};

export const modal_component_styles = {
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 128, 128, 1)',
  },
  modalContainer: {
    height: '100%',
    width: '40%',
    flexDirection: 'column',  // make sure the flex direction is column
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: common_styles.appTheme.backgroundColor,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  titleContainer: {
    borderBottom: '1px solid rgba(96, 96, 96, 0.5)',
    backgroundColor: common_styles.appTheme.backgroundColor,
    margin: '10px auto',
    padding: '10px auto',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: common_styles.appTheme.color,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  }
};

export const select_interests_scrollview_styles = {
  parentContainer: {
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column', // Make sure children are stacked vertically
    flex: 1,
  },
  switchContainer: {
    display: 'flex',
    flexDirection: 'row',     // Make sure children are in a row
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  switchLabel: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: '10px',
    // marginBottom: '10px',
  },
  itemText: {
    marginLeft: '10px',
    fontSize: '16px',
    color: common_styles.appTheme.color,
  },
  scrollView: {
    margin: '20px',
    boxShadow: '10px 10px 10px 0px rgba(0, 0, 0, 0.5)',
  },
};

export const side_panel_styles = {
  container: {
    position: 'absolute',
    height: `${display_container_top}vh`,
    bottom: 0,
    width: windowWidth > 800 ? '30%' : '100%',
    // minWidth: '300px',
    backgroundColor: common_styles.appTheme.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',        // Center children horizontally
    justifyContent: 'flex-start',    // Center children vertically
    boxShadow: '10px 10px 10px 0px rgba(0, 0, 0, 0.50)',
  }
};

export const text_component_styles = {
  view: {
    color: common_styles.appTheme.color,
    padding: `${common_styles.appTheme.padding}px`
  }
};

export const text_input_styles = {
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    // padding: '16px auto',
    // margin: '10px auto',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',

  },
  input: {
    fontSize: 16,
    width: '100%',
    // height: 40,
    color: common_styles.appTheme.color,
    borderColor: common_styles.appTheme.color, // Set border color to transparent to avoid overlapping
    outlineWidth: 1, // Remove outline 
  },
  inputLabel: {
    color: common_styles.appTheme.color,
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 4,
    paddingTop: 2,
    paddingBottom: 2,
  }
};

export const time_range_slider_styles = {
  view: {
    padding: '20px',
  },
  text: {
    color: common_styles.appTheme.color
  },
  timeSliderView: {
    padding: '0px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container_style: {
    paddingTop: '0px',
    paddingBottom: '0px',
    height: 'auto'
  },
  handle_label_style: {
    backgroundColor: 'transparent',
    color: '#000'
  },
  label_style: {
    fontSize: '16px',
    color: '#000'
  }
};

export const toolbar_styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: `${toolbar_height}vh`,
    width: '100%',
  },
  toolbarComponent: {
    ...button_styles.standardButton,
    padding: '20px auto',
  },
  toolbarButtonLeft: {
   ...button_styles.standardButton,
   padding: '20px auto',

  },
  toolbarButtonRight: {
    ...button_styles.standardButton,
    padding: '20px auto',
  },
  centerView: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
  },
  centeredButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerButton: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  icon: {
    height: '35px',
    width: '35px'
  }
};

export const tooltip_styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#222', // Dark background color
    color: '#fff', // Light text color
    padding: '10px', // Add padding for better appearance
    borderRadius: '4px', // Add border radius for a smoother look
    margin: 0,
  },
  table: {
    margin: '10px',
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
    fontWeight: 600,
    marginRight: '4px',
    paddingLeft: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    textAlign: 'right',
  },
  value: {
    padding: '2px',
  },
  buttonStyle: {
    backgroundColor: '#2196F3',
  },
  infoWindowStyle: {
    padding: 0,
    margin: 0,
  },
};
