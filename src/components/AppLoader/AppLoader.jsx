import { useEffect, useState, useContext } from "preact/hooks";
import classNames from "classnames";
import { useTransition, animated } from "@react-spring/web";

import { StorageContext } from "../../contexts/StorageContext";
import { getThemeName } from "../../utils/index";

import "./AppLoader.css";

const loadingTips = [
    <><div className='keybind'><span>ctrl+l</span></div> pour trouver rapidement une conversation ou un salon précédent.</>,
    <><div className='keybind'><span>alt+click</span></div> un message pour le marquer comme non lu.</>,
    <><div className='keybind'><span>shift+esc</span></div> pour marquer un serveur entier comme lu.</>,
    <><div className='keybind'><span>down</span></div> naviguera entre les salons non lus.</>,
    <>Utilise <div className='keybind'><span>ctrl+/</span></div> pour afficher la liste des raccourcis de clavier.</>,
    <><div className='keybind'><span>shift+enter</span></div> pour sauter à la ligne sans envoyer ton message.</>,
    <>Maintenir <div className='keybind'><span>shift</span></div> tout en cliquant sur un émoji te permet d'envoyer plusieurs émojis.</>,
    <>Tu peux appuyer sur <div className='keybind'><span>up</span></div> pour éditer rapidement ton message le plus récent.</>,
    <>Avant de choisir notre nom actuel, Discord a failli s'appeler Bonfire, ou feu de joie, pour rappeler un endroit chaleureux et accueillant.</>,
    <>En des temps bien reculés, Discord n'était accessible que par navigateur web.</>,
    <>Notre programme Discord HypeSquad comporte trois maisons dans lesquelles tu peux être envoyé(e) en faisant le quizz de l'application : Bravery, Balance et Brilliance.</>,
    <>Le personnage qui se trouve sur notre page 404 est un hamster robot répondant au doux nom de Nelly.</>,
    <>Il est possible de jouer à notre propre version du jeu Snake sur la page 404 en appuyant sur un bouton <div className='keybind'><span>del</span></div>.</>,
    <>Tu as une toute petite - et nous insistons sur « petite » - chance d'obtenir une sonnerie secrète quand tu appelles quelqu'un. Bonne chance !</>,
    <>L'ancienne mascotte du programme Partner était incarnée par un elfe appelé Springle. Il a récemment décidé de prendre une retraite bien méritée.</>,
    <>Avant de choisir notre nom actuel, Discord a failli s'appeler Wyvern. D'accord, nous n'étions pas particulièrement inspirés.</>,
    <>Psst ! En cliquant sur certaines choses dans l'application, il est possible de découvrir tout un tas de références cachées.</>,
    <>Discord a fait ses premiers pas en tant qu'entreprise de jeux vidéo avec un jeu pour mobile intitulé Fates Forever.</>,
    <>La date de création officielle de Discord est le 13 mai 2015.</>,
    <>L'idée de l'abonnement Discord Nitro nous est venue en mangeant nos céréales au petit déj'.</>,
    <>Notre mascotte, Wumpus, avait été créée à l'origine comme un personnage qui n'avait pas d'amis :(</>,
    <>À ses débuts, Discord n'avait que le thème clair de disponible. Le thème sombre n'est arrivé qu'en août 2015.</>,
    <>Tu peux utiliser le mode streamer pour masquer tes informations personnelles en streamant.</>,
    <>Les groupes privés peuvent contenir jusqu'à dix membres.</>,
    <>Clique sur la boussole dans ta liste de serveurs pour trouver de nouveaux serveurs.</>,
    <>Fais glisser des serveurs et dépose-les les uns sur les autres pour créer des dossiers de serveurs.</>,
    <>Tape /gif ou /tenor + ce que tu veux pour trouver un GIF en lien avec ce sujet !</>,
    <>Partage les jeux auxquels tu joues avec les paramètres d'activité de jeu.</>,
    <>Surligne du texte dans ta barre de discussion pour le mettre en gras, en italique, et plus encore.</>,
    <>Cache les salons muets dans un serveur en faisant un clic droit sur le nom du serveur.</>,
    <>Personnalise l'apparence de Discord dans le menu des paramètres utilisateur.</>,
    <>Relie tes comptes de réseaux sociaux préférés dans les paramètres de connexion.</>,
    <>Tu peux créer des catégories de salons pour grouper et organiser tes salons.</>,
    <>Tu peux taper /tableflip et /unflip pour pimenter tes messages.</>,
    <>Tu peux rejoindre jusqu'à 100 serveurs, mais grâce à Nitro, il est possible d'en rejoindre jusqu'à 200 !</>,
    <>Tu peux faire glisser et déposer des fichiers dans Discord pour les mettre en ligne.</>,
    <>Change le volume de chaque participant en faisant un clic droit dessus pendant un appel.</>,
    <>Fais un clic droit pour épingler un message dans un salon ou en MP pour le sauvegarder pour plus tard.</>,
    <>Tape un signe plus devant le nom d'un émoji pour le transformer en réaction.</>,
    <>Tu peux taper /nick pour changer rapidement ton pseudo dans un serveur.</>,
    <>Tu peux taper / pour afficher les commandes de bot et autres commandes intégrées</>,
    <>Tu peux mettre des ** autour de ce que tu écris pour le mettre en <strong>gras</strong>.</>,
    <>Les caractères comme @, #, ! et * affineront les résultats de Quick Switcher.</>,
    <>Clique sur le nom d'un serveur dans le sélecteur d'émojis pour cacher les émojis de ce serveur.</>,
    <>Survole un GIF et clique sur l'étoile pour l'ajouter à tes favoris.</>,
    <>Le rôle supérieur pour un utilisateur définit la couleur de cet utilisateur.</>,
    <>Une icône de micro rouge indique qu'un administrateur du serveur a rendu cette personne muette.</>,
    <>Tu peux rendre temporairement muet un serveur ou un salon en faisant un clic droit dessus.</>,
    <>Clique sur ton avatar dans le coin inférieur gauche pour définir un statut personnalisé.</>
];

export default function AppLoader({ ready = false }) {
    const storage = useContext(StorageContext);
    const [showProblem, setShowProblem] = useState(false);

    const startupVideo = storage.getStartupVideo();
    const theme = getThemeName(storage.getUserSettings());
    const loadingTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];

    const transition = useTransition(!ready, {
        from: { opacity: 1 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 200 }
    });

    useEffect(() => {
        if (ready) return;
        const timer = setTimeout(() => setShowProblem(true), 10000);
        return () => clearTimeout(timer);
    }, [ready]);

    useEffect(() => {
        if (!ready) setShowProblem(false);
    }, [ready]);

    return transition((style, item) =>
        item ? (
            <animated.div style={style} className="app-loader">
                <div className="content">
                    <video src={`/assets/videos/startup/${startupVideo}-${theme}.webm`} muted autoplay loop />
                    <h1>Le savais-tu</h1>
                    <div className="tip">{loadingTip}</div>
                    <span className="error"></span>
                </div>
                <div className={classNames("problem", { show: showProblem })}>
                    <div className="text">Problèmes de connexion ? Dis-le nous !</div>
                    <div className="links">
                        <a href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16">
                                <path fill="currentColor" d="M1,14.1538462 L1.95,14.1538462 C3.73125,14.1538462 5.5125,13.5384615 6.81875,12.4307692 C5.15625,12.4307692 3.73125,11.2 3.1375,9.6 C3.375,9.6 3.6125,9.72307692 3.85,9.72307692 C4.20625,9.72307692 4.5625,9.72307692 4.91875,9.6 C3.1375,9.23076923 1.7125,7.63076923 1.7125,5.66153846 C2.1875,5.90769231 2.78125,6.15384615 3.49375,6.15384615 C2.425,5.41538462 1.83125,4.18461538 1.83125,2.70769231 C1.83125,1.96923077 2.06875,1.23076923 2.30625,0.615384615 C4.20625,3.07692308 7.05625,4.67692308 10.38125,4.8 C10.2625,4.67692308 10.2625,4.30769231 10.2625,4.06153846 C10.2625,1.84615385 12.04375,0 14.18125,0 C15.25,0 16.31875,0.492307692 17.03125,1.23076923 C17.8625,1.10769231 18.8125,0.738461538 19.525,0.246153846 C19.2875,1.23076923 18.575,1.96923077 17.8625,2.46153846 C18.575,2.46153846 19.2875,2.21538462 20,1.84615385 C19.525,2.70769231 18.8125,3.32307692 18.1,3.93846154 L18.1,4.43076923 C18.1,9.84615385 14.18125,16 6.9375,16 C4.68125,16 2.6625,15.3846154 1,14.1538462 Z" />
                            </svg>
                            <span>Tweete-nous</span>
                        </a>
                        <a href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
                                <path fill="currentColor" d="M6.99471698,9.67522659 C8.47108874,9.67522659 9.66792453,8.47748685 9.66792453,7 C9.66792453,5.52251315 8.47108874,4.32477341 6.99471698,4.32477341 C5.51834522,4.32477341 4.32150943,5.52251315 4.32150943,7 C4.32150943,8.47748685 5.51834522,9.67522659 6.99471698,9.67522659 Z M6.99471698,2.67522659 C8.18867925,2.67522659 9.26641509,3.16163142 10.0483019,3.94410876 L11.9396226,2.05135952 C10.6822642,0.782477341 8.92830189,0 6.99471698,0 C3.12754717,0 0,3.14048338 0,7 L2.67320755,7 C2.67320755,4.6102719 4.60679245,2.67522659 6.99471698,2.67522659 Z M11.3267925,7 C11.3267925,9.3897281 9.39320755,11.3247734 7.00528302,11.3247734 C5.81132075,11.3247734 4.73358491,10.8383686 3.94113208,10.0558912 L2.04981132,11.9486405 C3.31773585,13.2175227 5.06113208,14 6.99471698,14 C10.8618868,14 14,10.8595166 14,7 L11.3267925,7 Z" />
                            </svg>
                            <span>État du réseau</span>
                        </a>
                    </div>
                </div>
            </animated.div>
        ) : null
    );
};