import UserProfilePopout from "./UserProfilePopout";
import AccountMenu from "./AccountMenu";
import styles from "./UserProfilePopout.module.css";

export default function CurrentUserProfilePopout({ client }) {
    return (
        <UserProfilePopout client={client}>
            <div className={styles.divider}></div>
            <AccountMenu client={client}/>
        </UserProfilePopout>
    );
};