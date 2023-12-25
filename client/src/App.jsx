import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Post from "./components/Post";
import Layout from "./components/layout";
import IndexPage from "./Pages/IndexPage";
import LoginPage from "./Pages/loginPage";
import RegisterPage from "./Pages/registerPage";
import { UserContextProvider } from "./UserContext";
import { CreatePost } from "./Pages/CreatePost";
import PostPage from "./Pages/PostPage";
import EditPost from "./Pages/EditPost";

function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path='/create' element={<CreatePost />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Route>
    </Routes>
    </UserContextProvider>
  );
}

export default App;
