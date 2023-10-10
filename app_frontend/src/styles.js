// Assuming you might need windowWidth, using window.innerWidth for web
const windowWidth = window.innerWidth;

const defaultBackgroundColor = '#333333';
const defaultFontColor = '#ffffff';
const defaultPadding = 10;
const defaultMargin = 10;
const defaultBorderRadius = 8;
const brightBlueColor = '#2196F3';

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
  container: {
    ...common_styles.appTheme,
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0',
  },
  title: common_styles.h1,
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

// export const create_account_styles = StyleSheet.create({
//   container: {
//     ...common_styles.appTheme,
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   loginLinkContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     margin: 16
//   },
//   loginLink: {
//     color: '#2196F3',
//     textDecorationLine: 'underline',
//   },
// });
export const button_styles = {
  standardButton: {
    paddingLeft: defaultPadding,
    paddingRight: defaultPadding,
    paddingTop: '5px',
    paddingBottom: '5px',
    borderRadius: defaultBorderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu_button_styles: {
    backgroundColor: brightBlueColor,
    height: '50px',
  },
  clear_button_styles: {
    backgroundColor: defaultBackgroundColor,
  },
  button_text: {
    color: defaultFontColor,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  icon: {
    height: '30px',
    width: '30px',
  },
};

export const calendar_styles = {
  view: {
    boxSizing: 'border-box',
    // width: 'calc(100% - 20px)', // Account for the padding
  
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


export const map_styles = {
  mapContainerStyle: {
    display: 'flex',
    // width: '100%',
    // height: '100%',
    width: '100vw',
    height: '100vh',
  },
  pinStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -100%)',
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
  },
};

// export const modal_component_styles = StyleSheet.create({
//   backdrop: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     height: '80%',
//     width: '40%',
//     flexDirection: 'column',  // make sure the flex direction is column
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: common_styles.appTheme.backgroundColor,
//     borderRadius: 10,
// 		overflow: 'hidden'
//   },
//   titleContainer: {
//     borderBottomWidth: 1,
//     borderColor: 'rgba(96, 96, 96, 0.5)',
//     padding: 10,
//     margin: 10,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: common_styles.appTheme.color,
//   },
//   submit_button_container: {
//     borderTopWidth: 1,
//     borderColor: 'rgba(96, 96, 96, 0.5)',
//     padding: 10,
//     margin: 10,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   contentContainer: {
//     flex: 1, 
//     width: '100%',
//   }
// });

// export const modal_styles = StyleSheet.create({
//   itemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   itemText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: common_styles.appTheme.color,
//   },
//   buttonStyle: {
//     marginBottom: 20,
//     backgroundColor: brightBlueColor,
//   },
//   scrollView: {
//     marginLeft: 20,
//     marginRight: 20,
//   },
//   textInputStyle: {
//     margin: 20,
//   },
//   componentStyle: {
//     width: '100%',
//     margin: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//   }
// });
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
  buttonStyle: {
    marginBottom: '20px',
    backgroundColor: '#2196F3',
  },
  scrollView: {
    margin: '20px',
    boxShadow: '10px 10px 10px 0px rgba(0, 0, 0, 0.5)',
  },
};


export const side_panel_styles = {
  container: {
    position: 'absolute',
    top: 0,
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


// export const text_input_styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     padding: 0,
//     margin: 10
//   },
//   input: {
//     fontSize: 16,
//     height: 40,
//     color: common_styles.appTheme.color,
//     borderColor: 'rgba(0, 0, 0, 0)', // Set border color to transparent to avoid overlapping
//     outlineWidth: 0, // Remove outline 
//   },
// });
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
    width: '100%',
    paddingTop: '0px'
  },
  toolbarComponent: {
    height: '100%',
  },
  toolbarButtonLeft: {
    paddingLeft: '10px',
  },
  toolbarButtonRight: {
    paddingRight: '10px',
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


// export const top_panel_styles = StyleSheet.create({
// 	container: {
// 		position: 'absolute',
// 		left: '20%',
// 		right: '20%',
// 		backgroundColor: common_styles.appTheme.backgroundColor,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		shadowColor: '#000',
// 		shadowOffset: {
// 			width: 10,
// 			height: 10,
// 		},
// 		width: '60%',
// 		shadowOpacity: 0.25,
// 		shadowRadius: 10,
// 		elevation: 5,
// 		zIndex: 10,
// 		overflow: 'hidden',
// 	},
// })