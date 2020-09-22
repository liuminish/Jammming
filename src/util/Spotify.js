let accessToken;
const clientId = '47da40802af849bc96be473019535c87';
const redirectURI = 'http://localhost:3000/';

const spotify = {
    getAccessToken() {
        console.log('getting access token');
        if(accessToken) {
            return accessToken
        } else {
            const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
            const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
            
            if (accessTokenMatch && expiresInMatch) {
                accessToken = accessTokenMatch[1];
                const expiresIn = Number(expiresInMatch[1]);
                console.log(expiresIn)            
                window.setTimeout(() => accessToken = '', expiresIn * 1000);
                window.history.pushState('Access Token', null, '/');
                return accessToken;
            } else {
                window.location  = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}&scope=user-read-private%20user-read-email&response_type=token&state=123`
            }
        }
    },

    search(term) {
        const accessToken = spotify.getAccessToken();
        
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (jsonResponse.tracks) {
                console.log(accessToken)
                return jsonResponse.tracks.items.map((track) => {
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    };
                });
            } else {
                return []; 
            }  
        })
    },

    savePlaylist(playlistName, trackUris) {
        if(!playlistName || !trackUris) {
            return;
        }

        const accessToken = spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch('https://api.spotify.com/v1/me', {
            headers: headers}).then(response => {
                return response.json();
            }).then(jsonResponse => {
                userId = jsonResponse.id
                console.log(accessToken)
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ name: playlistName })
                })
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris : trackUris })
                })
            })
    },

        
};

export default spotify;