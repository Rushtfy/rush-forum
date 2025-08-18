import { faChartLine, faClipboard, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, deleteField, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defUser from '../../assets/default_user.jpg';
import { AuthContext } from "../../components/context/AuthContext";
import { db } from "../../firebase";
import './adminPanel.scss';

const AdminPanel = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const userData = await getDoc(doc(db, "users", currentUser.uid));

                if (!userData.exists() || userData.data().role !== "admin") {
                    navigate('/');
                    return;
                }

                fetchUsers();
                fetchPosts();
                fetchAnalytics();
            } catch (error) {
                console.log("Error verifying admin role:", error);
                navigate('/');
            }
        };

        if (currentUser && currentUser.uid) {
            verifyAdmin();
        }

        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);
            } catch (error) {
                console.log("Error fetching users:", error);
            }
        };

        const fetchPosts = async () => {
            try {
                const postsSnapshot = await getDocs(collection(db, "userPosts"));
                let postsData = [];
                postsSnapshot.forEach((doc) => {
                    postsData.push(...Object.values(doc.data()));
                });
                setPosts(postsData);
            } catch (error) {
                console.log("Error fetching posts:", error);
            }
        };

        const fetchAnalytics = () => {
            setAnalytics({
                totalUsers: users.length,
                totalPosts: posts.length,
            });
        };

    }, [currentUser, users, posts, navigate]);

    const banUser = async (userId) => {
        try {
            const userDoc = doc(db, "users", userId);
            await updateDoc(userDoc, { status: "banned" });
            alert("User banned successfully");
        } catch (error) {
            console.log("Error banning user:", error);
        }
    };

    const unbanUser = async (userId) => {
        try {
            const userDoc = doc(db, "users", userId);
            await updateDoc(userDoc, { status: "active" });
            alert("User unbanned successfully");
        } catch (error) {
            console.log("Error unbanning user:", error);
        }
    };

    const removePost = async (postId, ownerUid) => {
        try {
            const postDoc = doc(db, "userPosts", ownerUid);
            await updateDoc(postDoc, {
                [postId]: deleteField()
            });
            alert("Post removed successfully");

        } catch (error) {
            console.log("Error removing post:", error);
        }
    };

    return (
        <div className="admin-panel">
            <div className="sidebarAdmin">
                <ul>
                    <li onClick={() => setActiveTab("users")}>
                        <FontAwesomeIcon icon={faUsers} /> Users
                    </li>
                    <li onClick={() => setActiveTab("posts")}>
                        <FontAwesomeIcon icon={faClipboard} /> Posts
                    </li>
                    <li onClick={() => setActiveTab("analytics")}>
                        <FontAwesomeIcon icon={faChartLine} /> Analytics
                    </li>
                </ul>
            </div>

            <div className="main-content">
                {activeTab === "users" && (
                    <div className="users-tab">
                        <h2>User Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Profile Picture</th>
                                    <th>Email</th>
                                    <th>User ID</th>
                                    <th>Status</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.uid}>
                                        <td>{user.displayName}</td>
                                        <td><img src={user.photoURL || defUser} alt="Profile" /></td>
                                        <td>{user.email}</td>
                                        <td>{user.uid}</td>
                                        <td>{user.status || "active"}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            {user.status === "banned" ? (
                                                <button onClick={() => unbanUser(user.uid)}>Unban</button>
                                            ) : (
                                                <button onClick={() => banUser(user.uid)}>Ban</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "posts" && (
                    <div className="posts-tab">
                        <h2>Post Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Owner</th>
                                    <th>Category</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post, index) => (
                                    <tr key={index}>
                                        <td>{post.title}</td>
                                        <td>{post.ownerUid}</td>
                                        <td>
                                            <React.Fragment>
                                                {post.tags && post.tags.map((tag, tagIndex) => (
                                                    <p key={tagIndex}>{tag}</p>
                                                ))}
                                            </React.Fragment>
                                        </td>
                                        <td>
                                            <button onClick={() => removePost(post.id, post.ownerUid)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="analytics-tab">
                        <h2>Analytics</h2>
                        <p>Total Users: {analytics.totalUsers}</p>
                        <p>Total Posts: {analytics.totalPosts}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;