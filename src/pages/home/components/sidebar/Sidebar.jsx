import React from 'react'
import './sidebar.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faUsers } from '@fortawesome/free-solid-svg-icons'

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <div className='containerSidebar'>
                <div className='discussionStarterBox'>
                    {/* <button>Start a new Discussion</button> */}
                    <button className="pushable">
                        <span className="edge"></span>
                        <span className="front"> Start a new Discussion </span>
                    </button>
                    <ul>
                        <li className='test'><FontAwesomeIcon icon={faComments} />All discussions</li>
                        <li><FontAwesomeIcon icon={faUsers} />Following</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar