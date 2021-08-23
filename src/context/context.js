import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
    const [githubUser, setGithubUser] = useState(mockUser);
    const [githubRepos, setGithubRepos] = useState(mockRepos);
    const [githubFollowers, setGithubFollowers] = useState(mockFollowers);
    const [request, setRequest] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ show: false, msg: '' });

    const searchGithubUser = async (user) => {
        toggleError();
        setIsLoading(true);
        const response = await axios
            .get(`${rootUrl}/users/${user}`)
            .catch((error) => {
                console.log(error);
            });

        if (response) {
            setGithubUser(response.data);
            const { login, followers_url } = response.data;

            await Promise.allSettled([
                axios(`${rootUrl}/users/${login}/repos?per_page=100`),
                axios(`${followers_url}?per_page=100`),
            ])
                .then((results) => {
                    console.log(results);
                    const [repos, followers] = results;
                    const status = 'fulfilled';
                    if (repos.status === status) {
                        setGithubRepos(repos.value.data);
                    }
                    if (followers.status === status) {
                        setGithubFollowers(followers.value.data);
                    }
                })
                .catch((error) => console.log(error));
        } else {
            toggleError(true, 'There is no user with that username.');
        }
        checkRequest();
        setIsLoading(false);
    };

    const checkRequest = () => {
        axios(`${rootUrl}/rate_limit`)
            .then(({ data }) => {
                let {
                    rate: { remaining },
                } = data;
                setRequest(remaining);
                if (remaining === 0) {
                    toggleError(
                        true,
                        'You make to many request, you can only make 60 an hour.'
                    );
                }
            })

            .catch((err) => {});
    };

    function toggleError(show = false, msg = '') {
        setError({ show, msg });
    }

    useEffect(checkRequest, []);

    return (
        <GithubContext.Provider
            value={{
                githubUser,
                githubRepos,
                githubFollowers,
                request,
                error,
                searchGithubUser,
                isLoading,
            }}
        >
            {children}
        </GithubContext.Provider>
    );
};

export { GithubContext, GithubProvider };
