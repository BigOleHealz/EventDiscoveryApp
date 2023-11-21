import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Navbar from "../composite_components/Navbar";
import ContentContainer from "./ContentContainer";
import Footer from "../composite_components/Footer";

export default function Layout({ children, ...props }) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
      <Navbar {...props}/>  
      <main style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: '100%' }}>
        <ContentContainer {...props}/>
      </main>
      <Footer {...props}/>
    </Box>
  );
}
