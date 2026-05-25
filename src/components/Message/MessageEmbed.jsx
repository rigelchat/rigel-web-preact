import { useState, useEffect } from 'preact/hooks';
import styles from './MessageEmbed.module.css';

/**
 * Détecte si une URL pointe vers une image
 * @param {string} url 
 * @returns {boolean}
 */
export function isImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        
        // Extensions d'images communes
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        if (imageExtensions.some(ext => pathname.endsWith(ext))) {
            return true;
        }
        
        // URLs spécifiques de plateformes connues
        const imageHosts = [
            'tenor.com',
            'giphy.com',
            'media.discordapp.net',
            'cdn.discordapp.com',
            'i.imgur.com',
            'media.tenor.com'
        ];
        
        if (imageHosts.some(host => urlObj.hostname.includes(host))) {
            return true;
        }
        
        return false;
    } catch {
        return false;
    }
}

/**
 * Extrait les métadonnées d'une URL Tenor
 * @param {string} url 
 * @returns {Promise<object|null>}
 */
async function fetchTenorMetadata(url) {
    try {
        // Extraire l'ID du GIF depuis l'URL tenor
        const match = url.match(/tenor\.com\/view\/.*?-(\d+)$/);
        if (!match) return null;
        
        const gifId = match[1];
        const TENOR_API_KEY = "LIVDSRZULELA";
        
        const response = await fetch(
            `https://g.tenor.com/v1/gifs?ids=${gifId}&key=${TENOR_API_KEY}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const gif = data.results[0];
            return {
                url: gif.media[0].gif.url,
                previewUrl: gif.media[0].tinygif.url,
                width: gif.media[0].gif.dims[0],
                height: gif.media[0].gif.dims[1],
                title: gif.content_description
            };
        }
        
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées Tenor:', error);
        return null;
    }
}

/**
 * Composant pour afficher un embed d'image/GIF
 */
export default function MessageEmbed({ url }) {
    const [metadata, setMetadata] = useState(null);
    const [imageUrl, setImageUrl] = useState(url);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Charger les métadonnées si c'est un lien Tenor
    useEffect(() => {
        if (url.includes('tenor.com/view/')) {
            fetchTenorMetadata(url).then(data => {
                if (data) {
                    setMetadata(data);
                    setImageUrl(data.url);
                }
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [url]);

    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    if (error) {
        return (
            <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.errorLink}
            >
                {url}
            </a>
        );
    }

    return (
        <div className={styles.embedContainer}>
            <div className={styles.embedContent}>
                {loading && (
                    <div className={styles.embedLoader}>
                        Chargement...
                    </div>
                )}
                <img
                    src={imageUrl}
                    alt={metadata?.title || 'Image'}
                    className={styles.embedImage}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    style={{ display: loading ? 'none' : 'block' }}
                />
            </div>
        </div>
    );
}
