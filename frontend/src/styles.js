// Assuming you might need windowWidth, using window.innerWidth for web
const windowWidth = window.innerWidth;

const defaultBackgroundColor = '#333333';
const defaultFontColor = '#dddddd';
const defaultPadding = 10;
const defaultMargin = 10;
const defaultBorderRadius = 8;
const brightBlueColor = '#2196F3';


export const toolbar_height = 6;
export const display_container_top = 100 - 2 * toolbar_height;

export const common_styles = {
  defaultBackgroundColor: defaultBackgroundColor,
  defaultFontColor: defaultFontColor,
  defaultPadding: defaultPadding,
  defaultMargin: defaultMargin,
  defaultBorderRadius: defaultBorderRadius,
  brightBlueColor: brightBlueColor,
  appTheme: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    padding: `${defaultPadding}px`,
  },
  basicComponent: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    padding: { xs: "5px", sm: "5px", md: "10px" }
  },
  container: {
    display: 'flex',
    flex: '1',
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
  table_cell: {
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    borderBottom: 'none',
    padding: 0,
  }
};

export const login_page_styles = {
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
};

export const create_account_styles = {
  container: {
    ...common_styles.appTheme,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
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
    color: 'white',
    padding: { xs: "5px", sm: "7px", md: "9px", lg: "11px", xl: "13px" },
    borderRadius: { xs: "5px", sm: "7px", md: "9px", lg: "11px", xl: "13px" },
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
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input_location_text_component_styles: {
    position: 'relative',
    width: '20%',
    height: '50px',
    borderRadius: '8px',
    backgroundColor: defaultBackgroundColor,
    color: defaultFontColor,
    margin: '10px auto',
    padding: '10px auto',
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

export const content_container_styles = {
  container: {
    position: 'absolute',
    flexGrow: 1,
    minHeight: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%'
  }
}
export const map_styles = {
  mapContainerStyle: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  main_map_box: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

const content_padding = { xs: "10px", sm: "12px", md: "15px", lg: "17px", xl: "20px" }
const title_and_button_height = { xs: "40px", sm: "50px", md: "60px", lg: "70px", xl: "80px" }
export const modal_component_styles = {
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 128, 128, 1)',
  },
  modalContainer: {
    position: 'absolute',
    top: '50%',
    height: { xs: '80%', sm: '80%', md: '80%', lg: '75%', xl: '75%' },
    width: { xs: '95%', sm: '80%', md: '65%', lg: '57%', xl: '50%' },
    borderRadius: { xs: '10px', sm: '15px', md: '20px', lg: '25px', xl: '30px' },
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    padding: 0,
    backgroundColor: common_styles.appTheme.backgroundColor,
  },
  parentContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "10px"
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  wrapperContainers: {
    display: 'flex',
    justifyContent: 'center',
    padding: content_padding,
    borderRadius: "10px"
  },
  divider: {
    backgroundColor: 'grey',
    height: '2px',
  },
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: content_padding,
    maxWidth: '100%',
    position: 'relative'
  },
  title: {
    ...common_styles.h1,
    height: title_and_button_height,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    height: title_and_button_height,
    width: { xs: "80%", sm: "70%", md: "60%", lg: "50%", xl: "40%" },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: { xs: "5px", sm: "7px", md: "9px", lg: "11px", xl: "13px" },
  },

};

export const friend_request_styles = {
  contentContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  sendRequestContainer: {
    display: 'flex',
    flexGrow: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'auto',
    margin: '10px',
  }


};

export const select_interests_scrollview_styles = {
  parentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  switchContainer: {
    display: 'flex',
    flexDirection: 'row',
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
    padding: 0,
  },
  itemText: {
    marginLeft: '10px',
    fontSize: '16px',
    color: common_styles.appTheme.color,
  },
  scrollView: {
    marginLeft: "15px",
    marginRight: "15px",
    boxShadow: '10px 10px 10px 0px rgba(0, 0, 0, 0.5)',
  },
};

export const side_panel_styles = {
  container: {
    position: 'absolute',
    height: `${display_container_top}vh`,
    bottom: 0,
    width: windowWidth > 800 ? '30%' : '100%',
    backgroundColor: common_styles.appTheme.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',

  },
  input: {
    fontSize: 16,
    width: '100%',
    color: common_styles.appTheme.color,
    borderColor: common_styles.appTheme.color,
  },
  inputLabel: {
    color: common_styles.appTheme.color,
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 4,
    // paddingTop: 2,
    // paddingBottom: 2,
  }
};

export const time_range_slider_styles = {
  container: {
    marginLeft: { xs: "10px", sm: "15px", md: "20px" },
    marginRight: { xs: "10px", sm: "15px", md: "20px" },
    padding: 0

  },
  text_labels: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: { xs: "5px", sm: "7px", md: "9px" },
  },
};

export const tooltip_styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '4px',
    margin: 0,
  },
  table: {
    marginBottom: "10px",
    borderCollapse: 'collapse',
    width: '100%',
  },
  title: {
    ...common_styles.h1,
  },
  label: {
    whiteSpace: 'nowrap',
    fontWeight: 600,
    marginRight: '4px',
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

export const event_details_display_styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '4px',
    margin: 0,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    borderColor: common_styles.appTheme.backgroundColor
  },
  title: {
    ...common_styles.h1,
  },
  body: {
    backgroundColor: common_styles.appTheme.backgroundColor,
    borderColor: common_styles.appTheme.backgroundColor
  },
  row: {
    padding: '2px',
    backgroundColor: common_styles.appTheme.backgroundColor,
    borderColor: common_styles.appTheme.backgroundColor
  },
  label: {
    whiteSpace: 'nowrap',
    fontWeight: 600,
    marginRight: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    textAlign: 'right',
    backgroundColor: common_styles.appTheme.backgroundColor,
    color: common_styles.appTheme.color,
    borderColor: common_styles.appTheme.backgroundColor
  },
  value: {
    padding: '2px',
    backgroundColor: common_styles.appTheme.backgroundColor,
    color: common_styles.appTheme.color,
    borderColor: common_styles.appTheme.backgroundColor
  },
  buttonStyle: {
    backgroundColor: '#2196F3',
  },
  infoWindowStyle: {
    padding: 0,
    margin: 0,
  },
};

export const event_invite_styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '4px',
    margin: 0,
  },
  table: {
    border: 'none',
  },
  row: {
    backgroundColor: common_styles.appTheme.backgroundColor,
    border: 'none',
  },
  table: {
    marginBottom: "10px",
    borderCollapse: 'collapse',
    width: '100%',
  },
  title: {
    ...common_styles.h1,
    width: '100%',
    textAlign: 'left',
    color: common_styles.appTheme.color,
  },
  label: {
    whiteSpace: 'nowrap',
    width: 'auto',
    fontWeight: 600,
    color: common_styles.appTheme.color,
    marginRight: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    textAlign: 'right',
    border: 'none',
  },
  value: {
    padding: '2px',
    width: '100%',
    color: common_styles.appTheme.color,
    border: 'none',
  },
};

export const table_styles = {
  table_container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: common_styles.appTheme.backgroundColor,
    boxShadow: 24,
  },
  row: {
    backgroundColor: common_styles.appTheme.backgroundColor,
    borderBottom: 'none',
  },
  checkbox_cell: {
    align: 'left',
    width: 'auto',
    ...common_styles.table_cell
  },
  label_cell: {
    align: 'left',
    width: '100%',
    ...common_styles.table_cell
  },
  item_cell: {
    align: 'left',
    width: 'auto',
    marginLeft: '10px',
    ...common_styles.table_cell
  },
  accept_decline_cell: {
    align: 'right',
    alignItems: 'right',
    ...common_styles.table_cell
  }
};
