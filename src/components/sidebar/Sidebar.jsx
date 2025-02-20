import { faArrowRightFromBracket, faComments, faInbox, faUsers, faHouse, faMessage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './sidebar.scss'

const Sidebar = () => {

    const navigate = useNavigate();

    const goChat = () => {
        navigate("/chat");
    }

    const goHome = () => {
        navigate("/");
    }

    return (
        <div className='sidebar'>
            <div className='containerSidebar'>
                <div className='discussionStarterBox'>
                    <button className="pushable" onClick={() => navigate('/create')}>
                        <span className="edge"></span>
                        <span className="front"> Start a new Discussion </span>
                    </button>
                    <ul>
                        <li onClick={goHome}><FontAwesomeIcon icon={faHouse} />Home</li>
                        <li><FontAwesomeIcon icon={faUsers} />Following</li>
                        <li onClick={goChat}><FontAwesomeIcon icon={faMessage} />Chat</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar