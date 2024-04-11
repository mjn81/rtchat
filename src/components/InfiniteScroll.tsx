import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	AutoSizer,
	InfiniteLoader,
	List,
	WindowScroller,
	ListRowRenderer,
	WindowScrollerChildProps,
	InfiniteLoaderChildProps,
} from 'react-virtualized';

interface Repository {
	full_name: string;
	html_url: string;
	stargazers_count: number;
}

const REPOSITORIES_PER_PAGE = 100;
const BASE_GITHUB_API_URL = 'https://api.github.com';
const GITHUB_API_SEARCH_QUERY = `/search/repositories?q=language:javascript&sort=stars&per_page=${REPOSITORIES_PER_PAGE}`;

const handleRedirectToRepository = (repositoryUrl: string) => {
	window.open(repositoryUrl, '_blank');
};

const fetchRepositories = async (page: number): Promise<Repository[]> => {
	try {
		const { data } = await axios.get(
			`${BASE_GITHUB_API_URL}${GITHUB_API_SEARCH_QUERY}&page=${page}`
		);

		return data.items;
	} catch (error) {
		console.log(error);
		throw new Error('Error while fetching repositories from the GitHub API!');
	}
};

const Row: React.FC<{ style: React.CSSProperties; repository: Repository }> = ({
	style,
	repository,
}) => (
	<div
		className="listItem"
		style={style}
		onClick={() => handleRedirectToRepository(repository.html_url)}
	>
		<span className="repositoryName">{repository.full_name}</span>
		<span>
			(
			<span role="img" aria-label="star emoji">
				⭐
			</span>
			{repository.stargazers_count})
		</span>
	</div>
);

export const LazyInfiniteScroll: React.FC = () => {
	const [pageCount, setPageCount] = useState<number>(1);
	const [repositories, setRepositories] = useState<Repository[]>([]);
	const [isNextPageLoading, setIsNextPageLoading] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const repositories = await fetchRepositories(1);

			setRepositories(repositories);
			setPageCount((pageCount) => pageCount + 1);
		})();
	}, []);

	const rowRenderer: ListRowRenderer = ({ key, index, style }) => (
		<Row
			key={key}
			style={style}
			repository={repositories[index]}
		/>
	);

	const isRowLoaded = ({ index }: { index: number }) => !!repositories[index];

	const handleNewPageLoad = async () => {
		setIsNextPageLoading(true);
		const repositories = await fetchRepositories(pageCount);

		setPageCount((pageCount) => pageCount + 1);
		setRepositories((currentRepositories) => [
			...currentRepositories,
			...repositories,
		]);
		setIsNextPageLoading(false);
		return;
	};

	const loadMoreRows = isNextPageLoading ? () => {} : handleNewPageLoad;

	if (!repositories.length) return <span>Loading initial repositories</span>;

	return (
		<div className="container">
			<div className="heading">
				<h1>react-virtualized-infinite-scroll-demo</h1>
			</div>
			<div className="repositoriesWrapper">
				<AutoSizer disableHeight={true}>
					{({ width }) => (
						<WindowScroller>
							{({
								height,
								isScrolling,
								onChildScroll,
								scrollTop,
							}: WindowScrollerChildProps) => (
								<InfiniteLoader
									isRowLoaded={isRowLoaded}
									loadMoreRows={loadMoreRows}
									rowCount={1000}
								>
									{({
										onRowsRendered,
										registerChild,
									}: InfiniteLoaderChildProps) => (
										<List
											autoHeight
											onRowsRendered={onRowsRendered}
											ref={registerChild}
											height={height}
											isScrolling={isScrolling}
											onScroll={onChildScroll}
											rowCount={repositories.length}
											rowHeight={42}
											rowRenderer={rowRenderer}
											scrollTop={scrollTop}
											width={width}
										/>
									)}
								</InfiniteLoader>
							)}
						</WindowScroller>
					)}
				</AutoSizer>
				{isNextPageLoading && <span>loading more repositories..</span>}
			</div>
		</div>
	);
};