// App.tsx
import { BrowserRouter} from "react-router-dom";
import Routers from "./Index/Router/Routers.tsx";



const App = () => {
  return (
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
};

export default App;
