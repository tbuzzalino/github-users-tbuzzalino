import React, { useContext } from 'react';
import styled from 'styled-components';
import { GithubContext, GithubProvider } from '../context/context';
import { ExampleChart, Pie3D, Column3D, Bar3D, Doughnut2D } from './Charts';

const Repos = () => {
    const { githubRepos } = useContext(GithubContext);

    const languages = githubRepos.reduce((total, acc) => {
        const { language, stargazers_count } = acc;
        if (language === null) {
            return total;
        }
        //Si no tengo la propiedad language en el total la creo y le pongo un 1
        if (!total[language]) {
            total[language] = {
                label: language,
                value: 1,
                stars: stargazers_count,
            };
        } else {
            total[language] = {
                ...total[language],
                value: total[language].value + 1,
                stars: total[language].stars + stargazers_count,
            };
        }

        return total;
    }, {});

    // Con object values lo que hacemos es transformalo en un array y despues con el sort lo que hacemos es ordenar ese array. El slice lo usamos para que nada mas nos muestre 5 lenguajes.
    const mostUsed = Object.values(languages)
        .sort((a, b) => {
            return b.value - a.value;
        })
        .slice(0, 5);

    const mostPopular = Object.values(languages)
        .sort((a, b) => {
            return b.stars - a.stars;
        })
        .map((item) => {
            return { ...item, value: item.stars };
        })
        .slice(0, 5);

    let { stars, forks } = githubRepos.reduce(
        (total, item) => {
            const { stargazers_count, name, forks } = item;
            total.stars[stargazers_count] = {
                label: name,
                value: stargazers_count,
            };
            total.forks[forks] = { label: name, value: forks };
            return total;
        },
        {
            stars: {},
            forks: {},
        }
    );
    stars = Object.values(stars).slice(-5).reverse();
    forks = Object.keys(forks).slice(-5).reverse();

    return (
        <section className='section'>
            <Wrapper className='section-center'>
                <Pie3D data={mostUsed} />
                <Column3D data={stars} />
                <Doughnut2D data={mostPopular} />
                <Bar3D data={forks} />
            </Wrapper>
        </section>
    );
};

const Wrapper = styled.div`
    display: grid;
    justify-items: center;
    gap: 2rem;
    @media (min-width: 800px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (min-width: 1200px) {
        grid-template-columns: 2fr 3fr;
    }

    div {
        width: 100% !important;
    }
    .fusioncharts-container {
        width: 100% !important;
    }
    svg {
        width: 100% !important;
        border-radius: var(--radius) !important;
    }
`;

export default Repos;
