import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faClipboard, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc, getDoc, deleteField } from "firebase/firestore";
import './adminPanel.scss';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
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

        fetchUsers();
        fetchPosts();
        fetchAnalytics();
    }, [users, posts]);

    const banUser = async (userId) => {
        try {
            const userDoc = doc(db, "users", userId);
            await updateDoc(userDoc, { status: "banned" });
            alert("User banned successfully");
        } catch (error) {
            console.log("Error banning user:", error);
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
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.uid}>
                                        <td>{user.displayName}</td>
                                        <td><img src={user.photoURL || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"}></img></td>
                                        <td>{user.email}</td>
                                        <td>{user.uid}</td>
                                        <td>{user.status || "Active"}</td>
                                        <td>
                                            <button onClick={() => banUser(user.uid)}>Ban</button>
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