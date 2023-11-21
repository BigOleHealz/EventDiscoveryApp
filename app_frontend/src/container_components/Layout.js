import Box from "@mui/material/Box";
import Navbar from "../composite_components/Navbar";
import ContentContainer from "./ContentContainer";
import Footer from "../composite_components/Footer";

export default function Layout({ children, ...props }) {
  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
      <Navbar {...props}/> 
      <main label='main-content' style={{ position: 'relative', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
        <ContentContainer {...props}/>
      </main>
      <Footer {...props}/>
    </Box>
  );
}
