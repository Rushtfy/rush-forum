import { faChartLine, faClipboard, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, deleteField, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import defUser from '../../assets/default_user.jpg';
import { AuthContext } from "../../components/context/AuthContext";
import { db } from "../../firebase";
import './adminPanel.scss';

const AdminPanel = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);

    const [authzLoading, setAuthzLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [selectedUid, setSelectedUid] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [drawerLoading, setDrawerLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!selectedUid) return;
            setDrawerLoading(true);
            try {
                const snap = await getDoc(doc(db, "users", selectedUid));
                setSelectedDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            } finally {
                setDrawerLoading(false);
            }
        };
        run();
    }, [selectedUid]);


    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                if (!currentUser?.uid) return;
                const snap = await getDoc(doc(db, "users", currentUser.uid));
                if (!snap.exists() || snap.data()?.role !== "admin") {
                    navigate("/");
                    return;
                }
                setAuthzLoading(false);
            } catch (e) {
                setErr("Failed to verify admin privileges.");
                navigate("/");
            }
        };
        verifyAdmin();
    }, [currentUser?.uid, navigate]);

    useEffect(() => {
        const fetchAll = async () => {
            if (authzLoading) return;
            setDataLoading(true);
            setErr(null);
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setUsers(usersData);

                const postsSnap = await getDocs(collection(db, "userPosts"));
                const postsData = [];
                postsSnap.forEach(d => {
                    const map = d.data() || {};
                    Object.values(map).forEach(p => postsData.push(p));
                });
                setPosts(postsData);
            } catch (e) {
                setErr("Failed to load data.");
            } finally {
                setDataLoading(false);
            }
        };
        fetchAll();
    }, [authzLoading]);

    const analytics = useMemo(() => ({
        totalUsers: users.length,
        totalPosts: posts.length
    }), [users.length, posts.length]);

    const banUser = async (userId) => {
        try {
            await updateDoc(doc(db, "users", userId), { status: "banned" });
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: "banned" } : u));
            alert("User banned successfully");
        } catch (error) {
            console.log("Error banning user:", error);
            alert("Error banning user.");
        }
    };

    const unbanUser = async (userId) => {
        try {
            await updateDoc(doc(db, "users", userId), { status: "active" });
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: "active" } : u));
            alert("User unbanned successfully");
        } catch (error) {
            console.log("Error unbanning user:", error);
            alert("Error unbanning user.");
        }
    };

    const removePost = async (postId, ownerUid) => {
        try {
            await updateDoc(doc(db, "userPosts", ownerUid), { [postId]: deleteField() });
            setPosts(prev => prev.filter(p => !(p.id === postId && p.ownerUid === ownerUid)));
            alert("Post removed successfully");
        } catch (error) {
            console.log("Error removing post:", error);
            alert("Error removing post.");
        }
    };

    if (authzLoading) {
        return <div className="admin-panel admin-loading">Verifying admin…</div>;
    }

    return (
        <div className="admin-panel">
            <aside className="sidebarAdmin">
                <ul>
                    <li
                        className={activeTab === "users" ? "active" : ""}
                        onClick={() => setActiveTab("users")}
                    >
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Users</span>
                    </li>
                    <li
                        className={activeTab === "posts" ? "active" : ""}
                        onClick={() => setActiveTab("posts")}
                    >
                        <FontAwesomeIcon icon={faClipboard} />
                        <span>Posts</span>
                    </li>
                    <li
                        className={activeTab === "analytics" ? "active" : ""}
                        onClick={() => setActiveTab("analytics")}
                    >
                        <FontAwesomeIcon icon={faChartLine} />
                        <span>Analytics</span>
                    </li>
                </ul>
            </aside>

            <main className="main-content">
                {err && <div className="alert error">{err}</div>}
                {dataLoading && <div className="inlineLoader">Loading…</div>}

                {activeTab === "users" && (
                    <section className="users-tab panel">
                        <h2>User Management</h2>
                        <div className="tableWrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Profile</th>
                                        <th>Email</th>
                                        <th>User ID</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr
                                            key={u.uid}
                                            className="clickable"
                                            onClick={() => setSelectedUid(u.uid)}
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setSelectedUid(u.uid)}
                                        >
                                            <td>{u.displayName || "—"}</td>
                                            <td><img src={u.photoURL || defUser} alt="" /></td>
                                            <td className="mono">{u.email || "—"}</td>
                                            <td className="mono small">{u.uid}</td>
                                            <td><span className={`badge ${u.status === "banned" ? "danger" : "ok"}`}>{u.status || "active"}</span></td>
                                            <td>{u.role || "user"}</td>
                                            <td className="actions">
                                                {u.status === "banned"
                                                    ? <button className="btn ghost" onClick={(e) => { e.stopPropagation(); unbanUser(u.uid); }}>Unban</button>
                                                    : <button className="btn danger" onClick={(e) => { e.stopPropagation(); banUser(u.uid); }}>Ban</button>}
                                            </td>
                                        </tr>
                                    ))}
                                    {!users.length && !dataLoading && (
                                        <tr><td colSpan="7" className="empty">No users found.</td></tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "posts" && (
                    <section className="posts-tab panel">
                        <h2>Post Management</h2>
                        <div className="tableWrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Owner UID</th>
                                        <th>Tags</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((p, idx) => (
                                        <tr key={`${p.id}-${idx}`}>
                                            <td className="titleCol">{p.title || "—"}</td>
                                            <td className="mono small">{p.ownerUid}</td>
                                            <td className="tagsCol">
                                                {Array.isArray(p.tags) && p.tags.length ? (
                                                    <div className="tagList">
                                                        {p.tags.map((t, i) => <span key={`${t}-${i}`} className="chip">{t}</span>)}
                                                    </div>
                                                ) : "—"}
                                            </td>
                                            <td className="actions">
                                                <button className="btn danger" onClick={() => removePost(p.id, p.ownerUid)}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!posts.length && !dataLoading && (
                                        <tr><td colSpan="4" className="empty">No posts found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "analytics" && (
                    <section className="analytics-tab panel">
                        <h2>Analytics</h2>
                        <div className="cards">
                            <div className="statCard">
                                <p className="label">Total Users</p>
                                <p className="value">{analytics.totalUsers}</p>
                            </div>
                            <div className="statCard">
                                <p className="label">Total Posts</p>
                                <p className="value">{analytics.totalPosts}</p>
                            </div>
                        </div>
                    </section>
                )}

                {selectedUid && (
                    <div className="drawerOverlay" onClick={() => setSelectedUid(null)}>
                        <aside className="drawer" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                            <div className="drawerHeader">
                                <h3>User Details</h3>
                                <button className="iconBtn" onClick={() => setSelectedUid(null)} aria-label="Close">×</button>
                            </div>
                            <div className="drawerBody">
                                {drawerLoading ? (
                                    <div className="inlineLoader">Loading…</div>
                                ) : selectedDoc ? (
                                    <>
                                        <div className="userSummary">
                                            <img src={selectedDoc.photoURL || defUser} alt="" />
                                            <div>
                                                <div className="name">{selectedDoc.displayName || "—"}</div>
                                                <div className="muted mono small">{selectedDoc.email || "—"}</div>
                                                <div className="muted mono small">{selectedDoc.uid || selectedDoc.id}</div>
                                            </div>
                                        </div>
                                        <pre className="jsonView">{JSON.stringify(selectedDoc, null, 2)}</pre>
                                    </>
                                ) : (
                                    <div className="empty">User not found.</div>
                                )}
                            </div>
                            <div className="drawerFooter">
                                {selectedDoc?.status === "banned" ? (
                                    <button className="btn ghost" onClick={() => { unbanUser(selectedDoc.uid || selectedDoc.id); }}>Unban</button>
                                ) : (
                                    <button className="btn danger" onClick={() => { banUser(selectedDoc.uid || selectedDoc.id); }}>Ban</button>
                                )}
                            </div>
                        </aside>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminPanel;
