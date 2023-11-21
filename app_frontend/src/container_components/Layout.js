import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Navbar from "../composite_components/Navbar";
import ContentContainer from "./ContentContainer";
import Footer from "../composite_components/Footer";

export default function Layout({ children, ...props }) {
  return (
    <Box>
      <Navbar {...props}/>  
      <main>
        <ContentContainer {...props}/>
      </main>
      <Footer {...props}/>
    </Box>
  );
}
