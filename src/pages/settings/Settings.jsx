import React, { useContext, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import './settings.scss';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import Layout from '../../components/layout/Layout';

const Settings = () => {
    const { currentUser } = useContext(AuthContext);
    const [userName, setUserName] = useState(currentUser.displayName || "");
    const [email, setEmail] = useState(currentUser.email || "");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            if (userName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: userName });
            }

            if (email !== currentUser.email) {
                await updateEmail(currentUser, email);
                alert("Email updated successfully");
            }

            console.log("Profile updated successfully");
        } catch (error) {
            console.log("Error updating profile:", error);
            alert("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword && currentPassword) {
            try {
                const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);

                await updatePassword(currentUser, newPassword);
                alert("Password updated successfully!");
            } catch (error) {
                console.log("Error changing password:", error);
                alert("Error changing password. Please make sure your current password is correct.");
            }
        } else {
            alert("Please enter both current and new passwords.");
        }
    };

    return (
        <Layout>
            <div className="settingsBody">
                <h1>Settings</h1>
                <div className="settings-section">
                    <div className="setting-item">
                        <label>Username</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="setting-item">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled
                        />
                    </div>
                </div>
                <div className="settings-buttons">
                    <button onClick={handleSaveChanges} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="change-password-section">
                    <h2>Change Password</h2>
                    <div className="change-password-input">
                        <input
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={handleChangePassword}>Change Password</button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;