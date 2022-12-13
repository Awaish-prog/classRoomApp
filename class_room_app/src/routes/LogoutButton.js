import '../css/LogoutButton.css'
import { useNavigate } from 'react-router-dom';

export default function LogoutButton(props){
    
    const navigate = useNavigate();
    function handleLogout(){
        localStorage.setItem(props.email, "");
        navigate("/", {replace: true});
        
    }
    return(
        <div className='logout'>
            <button onClick={handleLogout} className='logoutButton'>Logout</button>
        </div>
    )
}