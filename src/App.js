import './App.css';
import { Routes, Route } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import Landing from './components/Landing';


function App() {

return (
    <div className="App">

            <Routes>

                
                <Route path="/" element={
                        <>
                            <Landing />
                        </>
                    } />

            </Routes>


        
    </div>
);
}

export default App;
