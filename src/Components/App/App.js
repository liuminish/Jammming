import React from 'react';

import './App.css';

import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        searchResults: [],
        playlistName: 'New Playlist',
        playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this)
  }

  addTrack(track) {
    const newPlaylistTracks = this.state.playlistTracks;

    const newSearchResults = this.state.searchResults.map(searchedTrack => {
      if (searchedTrack.id === track.id) {
      return {...searchedTrack, isAdded: true}
    } else {
        return searchedTrack;
      }
    })

    if (newPlaylistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    } else {
      this.setState({
        searchResults: newSearchResults,
        playlistTracks: [...newPlaylistTracks, track]
      });
    }
  }

  removeTrack(track) {
    const { playlistTracks, searchResults } = this.state;
    const newPlaylist = playlistTracks.filter(removedTrack => removedTrack.id !== track.id);

    const newSearchResults = searchResults.map(result => {
      if (result.id === track.id) {
        return {...result, isAdded: false}
      }

      return result
    })

    this.setState({ 
      playlistTracks: newPlaylist,
      searchResults: newSearchResults
    });
  }

  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    })
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(savedTrack => savedTrack.uri);
    spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: []
      })
    })
  }

  search(searchTerm) {
    spotify.search(searchTerm).then(searchResults => {
      this.setState({
        searchResults: searchResults 
        })
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults 
              searchResults={this.state.searchResults} 
              onAdd={this.addTrack} />
            
            <Playlist 
              playlistName={this.state.playlistName} 
              playlistTracks={this.state.playlistTracks} 
              onRemove={this.removeTrack} 
              onNameChange={this.updatePlaylistName} 
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
