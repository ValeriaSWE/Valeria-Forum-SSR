import {
	EditPost,
	GetImage,
	GetPost,
	LikeComment,
	LikePost,
	NewComment,
} from "~/api/posts";
import $ from "jquery";
import roleBadge from "./RoleBadge.module.css";
import styles from "./Post.module.css";
import { createSignal, For, Index, Show } from "solid-js";
import {
	A,
	createRouteData,
	Meta,
	refetchRouteData,
	useParams,
	useRouteData,
	useSearchParams,
} from "solid-start";
import SolidMarkdown from "@daimond113/solid-markdown";
import { timeSince } from "~/Components/UserInfo";
import { createStore } from "solid-js/store";
import PostTag from "~/Components/PostTag";
import Forum from "~/Components/Forum";
import { Skeleton } from "@suid/material";
import { createServerData$ } from "solid-start/server";
import { getUser } from "~/lib/user.sever";

//post type:
type postData = {
	_id: string;
	title: string;
	creator: {
		nicknames: string[];
		username: string;
		role: string;
		creatorPfp: {
			data: {
				type: string;
				data: string;
			};
			contentType: string;
		};
		roleRank: number;
		_id: string;
	};
	content: string;
	images: string[];
	isEdited: boolean;
	comments: string[];
	likes: string[];
	pinned: boolean;
	tags: [
		{
			color: string;
			minRank: number;
			name: string;
		}
	];
	likeCount: number;
	likedByUser: boolean;
	createdDate: string;
};

export function routeData() {
	const params = useParams();
	const [searchParams] = useSearchParams();

	// const data = createRouteData(async () => {
	// 	const res = await GetPost(
	// 		params.post,
	// 		searchParams.commentSort || "createdAt",
	// 		parseInt(searchParams.commentPage || "1") - 1,
	// 		parseInt(searchParams.commentLimit || "10")
	// 	);

	// 	const postData = res.data.post;
	// 	const data = {
	// 		...res.data,
	// 		post: {
	// 			...postData,
	// 			createdDate: timeSince(new Date(postData.createdAt).getTime()),
	// 			likeCount: postData.likes.length,
	// 			likedByUser:
	// 				postData.likes.includes() /*postData.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id)*/,
	// 			pfpRaw: postData.creator.profilePicture,
	// 			creatorPfp: `data:image/png;base64,${btoa(
	// 				new Uint8Array(postData.creator.profilePicture.data.data).reduce(
	// 					function (data, byte) {
	// 						return data + String.fromCharCode(byte);
	// 					},
	// 					""
	// 				)
	// 			)}`,
	// 		},
	// 	};

	// 	return data;
	// });
	const user = createServerData$(async (_, { request }) => {
		return await getUser(request);
	});

	const data = createServerData$(
		async ([params, searchParams], { request }) => {
			const user = await getUser(request);

			const res = await GetPost(
				params.post,
				searchParams.commentSort || "createdAt",
				parseInt(searchParams.commentPage || "1") - 1,
				parseInt(searchParams.commentLimit || "10")
			);

			const postData = res.data.post;
			const data = {
				...res.data,
				post: {
					...postData,
					createdDate: timeSince(new Date(postData.createdAt).getTime()),
					likeCount: postData.likes.length,
					// likedByUser: postData.likes.includes(user?._id),
					pfpRaw: postData.creator.profilePicture,
					creatorPfp: `data:image/png;base64,${btoa(
						new Uint8Array(postData.creator.profilePicture.data.data).reduce(
							function (data, byte) {
								return data + String.fromCharCode(byte);
							},
							""
						)
					)}`,
				},
			};

			return data;
		},
		{ key: () => [params, searchParams] }
	);

	return { data, user };
}

export default function PostForum() {
	return (
		<Forum>
			<Post />
		</Forum>
	);
}

function Loader() {
	return (
		<div class={styles.postComment}>
			<Skeleton height='2.5rem' variant='circular' style='aspect-ratio: 1/1;' />
			<Skeleton variant='text' width='7.25rem' style='font-size: 2rem;' />
			<div class={styles.loaderPostContent}>
				<Skeleton variant='text' style='font-size: 1.5rem;' />
				<Skeleton variant='text' style='font-size: 1rem;' />
			</div>
			<Skeleton variant='text' style='font-size: 1.5rem;' width='8rem' />
			<Skeleton
				variant='rectangular'
				width='3.25rem'
				height='2rem'
				style='border-radius: var(--border-radius)'
			/>
			<Skeleton
				variant='rectangular'
				width='3.25rem'
				height='2rem'
				style='border-radius: var(--border-radius)'
			/>
		</div>
	);
}

function Post() {
	const params = useParams();
	const [searchParams, setSearchParams] = useSearchParams();

	const [isEditing, setIsEditing] = createSignal(false);
	const [tags, setTags] = createStore([]); // All available tags (for when editing)

	const [newCommentRespondsTo, setNewCommentRespondsTo] = createSignal<null | {
		_id: string;
	}>(null);

	// Comment signals:
	const [allCommentsLoaded, setAllCommentsLoaded] = createSignal(true);
	const [commentSort, setCommentSort] = createSignal(
		searchParams.commentSort || "createdAt"
	);
	const [commentPage, setCommentPage] = createSignal(
		parseInt(searchParams.commentPage || "1")
	);
	const [commentLimit, setCommentLimit] = createSignal(
		parseInt(searchParams.commentLimit || "10")
	);

	const { data: postData, user } = useRouteData<typeof routeData>();

	/**
	 * Send create new comment axios Post to server and recieve updated comment list
	 */
	async function newComment() {
		const postId = params.post;

		if (!$("#new-comment").val()) return;

		const content = urlify($("#new-comment").val() as string);

		const respondsTo = newCommentRespondsTo()?._id;

		setNewCommentRespondsTo(null);

		$("#new-comment").val("");

		const token = ""; // JSON.parse(localStorage.getItem('profile'))?.token

		const { data } = await NewComment(postId, content, respondsTo, token);

		await refetchRouteData();

		$("html, body").scrollTop(
			$("#" + data.comments[data.comments.length - 1]._id).offset()!.top
		);
	}

	function Creator() {
		return (
			<A
				class={styles.creatorContainer}
				href={"/forum/user/" + postData()?.post.creator._id}
			>
				<div class={styles.creatorImg}>
					<img src={postData()?.post.creatorPfp} alt='' />
					<i
						class={"material-icons " + styles.verified}
						data={postData()?.post.creator.role}
					>
						verified
					</i>
				</div>
				<h2 class={styles.creatorName}>{postData()?.post.creator.username}</h2>
				<i class={roleBadge.role} data={postData()?.post.creator.role}>
					{postData()?.post.creator.role}
				</i>
			</A>
		);
	}

	function Comment(props: { comment: any }) {
		const [likedByUser, setLikedByUser] = createSignal(
			props.comment.likes.includes(user()?._id)
		); // props.comment.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
		const [likeCount, setLikeCount] = createSignal(props.comment.likes.length);

		const profilePicture = `data:image/png;base64,${btoa(
			new Uint8Array(props.comment.creator.profilePicture.data.data).reduce(
				function (data, byte) {
					return data + String.fromCharCode(byte);
				},
				""
			)
		)}`;

		return (
			<>
				<div class={styles.postComment} id={props.comment._id}>
					<Show when={props.comment.respondsTo}>
						<a
							onClick={() => highlightPost(props.comment.respondsTo._id)}
							class={styles.respondsTo}
						>
							<i class='material-icons'>reply</i>
							<p>
								@{props.comment.respondsTo.creator.username}{" "}
								{props.comment.respondsTo.content}
							</p>
						</a>
					</Show>

					<A
						class={styles.CommentCreator}
						href={"/forum/user/" + props.comment.creator._id}
					>
						<div class={styles.creatorImg}>
							<img class={styles.creatorImg} src={profilePicture} alt='' />
							<Show when={props.comment.creator.roleRank >= 5}>
								<i
									class={"material-icons " + styles.verified}
									data={props.comment.creator.role}
								>
									verified
								</i>
							</Show>
						</div>
						<h2 class={styles.creatorName}>{props.comment.creator.username}</h2>
						<Show when={props.comment.creator.roleRank >= 5}>
							<i class={roleBadge.role} data={props.comment.creator.role}>
								{props.comment.creator.role}
							</i>
						</Show>
					</A>

					<div class={styles.feedTitle}>
						<SolidMarkdown>{props.comment.content}</SolidMarkdown>
					</div>

					<div class={styles.commentStatitics}>
						<PostStatitics date={props.comment.createdAt} />
						<button
							class={styles.postLikeButton}
							onClick={() => {
								LikeComment(props.comment._id, user()?._id).then((res) => {
									setLikeCount(res.data.likes.length);
									setLikedByUser(res.data.likes.includes(user()?._id));
								});
							}}
						>
							<i
								class='material-icons'
								style={
									likedByUser()
										? "color: var(--color-blue-l);"
										: "color: inherit;"
								}
							>
								thumb_up
							</i>
							<span>{likeCount()}</span>
						</button>
						<button
							class={styles.postLikeButton}
							onClick={() => setNewCommentRespondsTo(props.comment)}
						>
							<i class='material-icons'>comment</i>
							<span>Svara</span>
						</button>
					</div>
				</div>
			</>
		);
	}

	async function sortComments() {
		// const res = await GetPost(params.post, commentSort(), commentPage() - 1, commentLimit())
		// const { post, commentPages } = res.data
		// const res = await GetPost(params.post, searchParams.commentSort || "createdAt", parseInt(searchParams.commentPage || "1") - 1, parseInt(searchParams.commentLimit || "10"))
		setAllCommentsLoaded(false);
		setSearchParams({
			commentSort: commentSort(),
			commentPage: commentPage(),
			commentLimit: commentLimit(),
		});
		// setCommentPages(commentPages)
		await refetchRouteData();
		setAllCommentsLoaded(true);
		// setComments(post.comments)
		// })
	}

	function PageButton(props: { v: number }) {
		const v = props.v;

		return (
			<Show
				when={v + 1 == commentPage()}
				fallback={
					<button
						class={styles.editFeedIconButton}
						onClick={() => {
							setCommentPage(v + 1);
							sortComments();
						}}
					>
						{v + 1}
					</button>
				}
			>
				<button
					class={styles.editFeedIconButton}
					style='cursor: unset; background-color: var(--color-white-m);'
				>
					{v + 1}
				</button>
			</Show>
		);
	}

	async function highlightPost(post: string) {
		const page = postData()?.commentPageDict[post] || 1;

		// if (page && page != commentPage()) {
		//     setCommentPage(page)
		//     await sortComments()
		// }

		$("html, body").scrollTop(
			$("#" + post).offset()?.top - $(window).height() / 2
		);
		setTimeout(function () {
			$("#" + post).addClass(styles.highlight);
		}, 500);
	}

	async function savePost() {
		let activeTags: string[] = [];
		tags.forEach((tag) => {
			if (tag.selected) {
				activeTags.push(tag._id);
			}
		});
		const newPostData = await EditPost(
			params.post,
			$("#editContent").val()!.toString(),
			activeTags,
			""
		); //JSON.parse(localStorage.getItem('profile'))?.token)

		await refetchRouteData();
		// setPost({...postData()?.post, content: newPostData.data.content, isEdited: newPostData.data.isEdited, tags: newPostData.data.tags})
		setIsEditing(false);
	}

	function EditPostView() {
		// GetAllowedTags(JSON.parse(localStorage.getItem('profile'))?.token || "").then(res => {
		//     const {data} = res
		//     setTags([])
		//     for (let i = 0; i < data.length; i++) {
		//         setTags([...tags, {...data[i], selected: findTag(data[i]._id), id: i}])
		//     }
		// })

		function findTag(tagId: string) {
			for (let i = 0; i < postData()?.post.tags.length; i++) {
				if (postData()?.post.tags[i]._id == tagId) {
					return true;
				}
			}
			return false;
		}

		function setTagActive(tagId: number, state: boolean) {
			setTags(
				(tag) => tag.id === tagId,
				"selected",
				(selected) => state
			);
		}
		return (
			<div class={styles.postContent}>
				<div class={styles.pickedTags}>
					<p>Valda taggar:</p>
					<div>
						<For each={tags}>
							{(tag, i) => (
								<Show when={tag.selected}>
									<PostTag
										isButton={true}
										icon={"cancel"}
										func={setTagActive(tag.id, false)}
										color={tag.color}
										name={tag.name}
									/>
								</Show>
							)}
						</For>
					</div>
				</div>
				<div class={styles.notPickedTags}>
					<p>Välj taggar:</p>
					<div>
						<For each={tags}>
							{(tag) => (
								<Show when={!tag.selected}>
									<PostTag
										isButton={true}
										icon={null}
										func={setTagActive(tag.id, true)}
										color={tag.color}
										name={tag.name}
									/>
								</Show>
							)}
						</For>
					</div>
				</div>
				<h1 class={styles.title} id='post-title'>
					{postData()?.post.title}
				</h1>
				{/* https://codepen.io/chriscoyier/pen/XWKEVLy */}
				<div
					class={styles.growWrap}
					data-replicated-value={postData()?.post.content}
				>
					<textarea
						class={styles.contentEditing}
						value={postData()?.post.content}
						id='editContent'
						onInput='this.parentNode.dataset.replicatedValue = this.value'
						onKeyDown={(e) => {
							if (e.ctrlKey && e.key === "s") {
								e.preventDefault();
								savePost();
							}
						}}
					></textarea>
				</div>
				<div class={styles.imageContainer} id='post-image-container'>
					<For each={postData()?.post.images}>
						{(image) => <Image imageData={image} />}
					</For>
				</div>
			</div>
		);
	}

	function PostView() {
		return (
			<div class={styles.postContent}>
				<div class={styles.tags}>
					<For each={postData()?.post.tags}>
						{(tag, i) => (
							<PostTag
								isButton={false}
								icon={null}
								func={null}
								color={tag.color}
								name={tag.name}
							/>
						)}
					</For>
				</div>
				<h1 class={styles.title} id='post-title'>
					{postData()?.post.title}
				</h1>
				<div class={styles.content} id='post-content'>
					{/* <Show when={postData()?.post.content}> */}
					{/* <SolidMarkdown components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                <Highlight
                                    children={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                    autoDetect={false}
                                    {...props}
                                />
                                ) : (
                                <code class={className} {...props}>
                                    {children}
                                </code>
                                )
                            }}
                            }>{postData()?.post.content}</SolidMarkdown> */}
					{/* {postData()?.post.content} */}
					<Show when={postData()?.post}>
						<SolidMarkdown>{postData()?.post.content}</SolidMarkdown>
					</Show>
					{/* <Highlight
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            autoDetect={false}
                            {...props}
                        /> */}
					{/* <p>
                            {postData()?.post.content}
                        </p> */}
					{/* </Show> */}
				</div>
				<div class={styles.imageContainer} id='post-image-container'>
					<For each={postData()?.post.images}>
						{(image) => <Image imageData={image} />}
					</For>
				</div>
			</div>
		);
	}

	function PostDisplay() {
		return (
			<div class={styles.inheritPost}>
				<div class={styles.postCreator} id='post-creator'>
					<Creator />
					{/* <Show when={post.creator._id == JSON.parse(localStorage.getItem('profile'))?.result._id && CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0)}>
                        <button class={styles.editBtn} onClick={async () => {
                            if (isEditing()) {
                                savePost()
                            } else {
                                setIsEditing(true)
                            }

                        }}>{isEditing() ? "Spara" : "Ändra"}</button>
                    </Show> */}
					{/* POST  */}
					<p class={styles.postDate}>{postData()?.post.createdDate} sedan</p>
					<Show when={postData()?.post.isEdited}>
						<span class={styles.editedBadge}>(Redigerad)</span>
					</Show>
				</div>
				<Show when={isEditing()} fallback={<PostView />}>
					<EditPostView />
				</Show>
				<div class={styles.postStatistics}>
					<button
						class={styles.postLikeButton}
						onClick={() => {
							LikePost(postData()?.post._id, user()?._id).then(async (res) => {
								await refetchRouteData();
								// setLikeCount(res.data.likes.length)
								// setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
							});
						}}
					>
						<i
							class='material-icons'
							id={"likes-icon-" + params.post}
							style={
								postData()?.post.likes.includes(user()?._id)
									? "color: var(--color-blue-l);"
									: "color: inherit;"
							}
						>
							thumb_up
						</i>
						<span id={"likes-" + params.post}>
							{postData()?.post.likeCount} Likes
						</span>
					</button>
					<button>
						<i class='material-icons'>share</i>
						<span>Dela</span>
					</button>
				</div>
			</div>
		);
	}

	function NewCommentCreation() {
		return (
			<div class={styles.newCommentForm}>
				<Show when={newCommentRespondsTo()}>
					<a
						onClick={() => highlightPost(newCommentRespondsTo()?._id as string)}
						class={styles.respondsTo}
					>
						<i class='material-icons'>reply</i>
						<p>
							@{newCommentRespondsTo()?.creator.username}{" "}
							{newCommentRespondsTo()?.content}
						</p>
						<button
							class={styles.cancelResponse}
							onClick={() => {
								setNewCommentRespondsTo(null);
							}}
						>
							X
						</button>
					</a>
				</Show>
				<form onSubmit={(e) => e.preventDefault()}>
					<input
						type='text'
						class={styles.newCommentInput}
						id='new-comment'
						autocomplete='off'
						placeholder='Skriv en kommentar'
					/>
					<button class={styles.postCommentButton} onClick={newComment}>
						<h4>Pulicera</h4>
						<i class='material-icons'>send</i>
					</button>
				</form>
			</div>
		);
	}

	function CommentControls() {
		return (
			<div
				class={styles.commentsControls}
				style={postData()?.post.comments.length == 0 ? "display: none;" : ""}
			>
				<div class={styles.commentSortControl}>
					<button
						id='sort-hot'
						class={styles.editFeedIconButton}
						onClick={() => {
							if (commentSort() == "interactionCount") {
								setCommentSort("interactionCount-inverse");
							} else {
								setCommentSort("interactionCount");
							}

							sortComments();
						}}
					>
						<i class='material-icons'>whatshot</i>
						<p>Populärt</p>
						<Show when={commentSort() == "interactionCount"}>
							<i class='material-icons' id='current-sort-icon'>
								keyboard_double_arrow_down
							</i>
						</Show>
						<Show when={commentSort() == "interactionCount-inverse"}>
							<i class='material-icons' id='current-sort-icon'>
								keyboard_double_arrow_up
							</i>
						</Show>
					</button>
					<button
						id='sort-latest'
						class={styles.editFeedIconButton}
						onClick={() => {
							if (commentSort() == "createdAt") {
								setCommentSort("createdAt-inverse");
							} else {
								setCommentSort("createdAt");
							}

							sortComments();
						}}
					>
						<i class='material-icons'>update</i>
						<p>Senaste</p>
						<Show when={commentSort() == "createdAt"}>
							<i class='material-icons' id='current-sort-icon'>
								keyboard_double_arrow_down
							</i>
						</Show>
						<Show when={commentSort() == "createdAt-inverse"}>
							<i class='material-icons' id='current-sort-icon'>
								keyboard_double_arrow_up
							</i>
						</Show>
					</button>
				</div>
				<div class={styles.commentPageControl}>
					<Show
						when={commentPage() > 1}
						fallback={
							<button
								class={styles.editFeedIconButton}
								style='background-color: var(--color-white-m); cursor: unset;'
							>
								<i class='material-icons'>navigate_before</i>
							</button>
						}
					>
						<button
							class={styles.editFeedIconButton}
							onClick={() => {
								setCommentPage(commentPage() - 1);
								sortComments();
							}}
						>
							<i class='material-icons'>navigate_before</i>
						</button>
					</Show>
					<button class={styles.editFeedIconButton} style='cursor: unset;'>
						Sida: {commentPage()}
					</button>
					<Show
						when={commentPage() < postData()?.commentPages}
						fallback={
							<button
								class={styles.editFeedIconButton}
								style='background-color: var(--color-white-m); cursor: unset;'
							>
								<i class='material-icons'>navigate_next</i>
							</button>
						}
					>
						<button
							class={styles.editFeedIconButton}
							onClick={() => {
								setCommentPage(commentPage() + 1);
								sortComments();
							}}
						>
							<i class='material-icons'>navigate_next</i>
						</button>
					</Show>
				</div>
			</div>
		);
	}

	function CommentPageSelector() {
		return (
			<div
				class={styles.commentsControls}
				style={
					"justify-content: center;" +
					(postData()?.commentPages < 2 ? "display: none;" : "")
				}
			>
				<div class={styles.commentPageControl}>
					<Show
						when={commentPage() > 1}
						fallback={
							<button
								class={styles.editFeedIconButton}
								style='background-color: var(--color-white-m); cursor: unset;'
							>
								<i class='material-icons'>navigate_before</i>
							</button>
						}
					>
						<button
							class={styles.editFeedIconButton}
							onClick={() => {
								setCommentPage(commentPage() - 1);
								sortComments();
							}}
						>
							<i class='material-icons'>navigate_before</i>
						</button>
					</Show>
					<Show
						when={postData()?.commentPages < 15}
						fallback={
							<>
								{/* Make style work when there is alot of commentPages */}
								<Show when={commentPage() <= 3}>
									<For each={[...Array(3).keys()]}>
										{(v, i) => <PageButton v={v} />}
									</For>
									<p>...</p>
									<For each={[postData()?.commentPages - 1]}>
										{(v, i) => <PageButton v={v} />}
									</For>
								</Show>
								<Show when={commentPage() >= postData()?.commentPages - 3}>
									<For each={[0]}>{(v, i) => <PageButton v={v} />}</For>
									<p>...</p>
									<For
										each={[
											postData()?.commentPages - 3,
											postData()?.commentPages - 2,
											postData()?.commentPages - 1,
										]}
									>
										{(v, i) => <PageButton v={v} />}
									</For>
								</Show>
								<Show
									when={
										commentPage() < postData()?.commentPages - 3 &&
										commentPage() > 3
									}
								>
									<For each={[0]}>{(v, i) => <PageButton v={v} />}</For>
									<p>...</p>
									<For
										each={[commentPage() - 2, commentPage() - 1, commentPage()]}
									>
										{(v, i) => <PageButton v={v} />}
									</For>
									<p>...</p>
									<For each={[postData()?.commentPages - 1]}>
										{(v, i) => <PageButton v={v} />}
									</For>
								</Show>
							</>
						}
					>
						<For each={[...Array(postData()?.commentPages).keys()]}>
							{(v, i) => <PageButton v={v} />}
						</For>
					</Show>
					<Show
						when={commentPage() < postData()?.commentPages}
						fallback={
							<button
								class={styles.editFeedIconButton}
								style='background-color: var(--color-white-m); cursor: unset;'
							>
								<i class='material-icons'>navigate_next</i>
							</button>
						}
					>
						<button
							class={styles.editFeedIconButton}
							onClick={() => {
								setCommentPage(commentPage() + 1);
								sortComments();
							}}
						>
							<i class='material-icons'>navigate_next</i>
						</button>
					</Show>
				</div>
			</div>
		);
	}

	function CommentsList() {
		return (
			<div class={styles.comments} id='comments'>
				<Show when={allCommentsLoaded()} fallback={Loader}>
					<For each={postData()?.post.comments /*comments()*/}>
						{(comment) => <Comment comment={comment} />}
					</For>
				</Show>
			</div>
		);
	}

	return (
		<>
			{/* <Meta name="twitter:title" content={postData()?.post.title}/> */}

			<Meta name='twitter:card' content='summary' />
			<Meta name='twitter:image' content={postData()?.post.creatorPfp} />
			<Meta name='og:image' content={postData()?.post.creatorPfp} />
			<Meta name='twitter:title' content={postData()?.post.title} />
			<Meta name='twitter:description' content={postData()?.post.content} />
			<Meta property='og:title' content={postData()?.post.title} />
			<Meta property='og:description' content={postData()?.post.content} />
			<Meta property='og:site_name' content='Valeria RP | Post' />

			<PostDisplay />

			<NewCommentCreation />

			<CommentControls />

			<CommentsList />

			<CommentPageSelector />
		</>
	);
}

function Image(props: { imageData: any }) {
	const [image, setImage] = createSignal("");

	GetImage(props.imageData).then((img) => {
		setImage(
			`data:image/png;base64,${btoa(
				new Uint8Array(img.data.data.data).reduce(function (data, byte) {
					return data + String.fromCharCode(byte);
				}, "")
			)}`
		);
	});

	return (
		<>
			<img src={image()} alt='' />
		</>
	);
}

// const ShowRoleInPost = (props: {
//     role: string;
// }) => {
//     return(
//         <>
//         <span class={styles.showRole}>
//         <i class={'material-icons ' + styles.verified} data={props.role}>verified</i>
//         <i class={roleBadge.role} data={props.role}>{props.role}</i>
//         </span>
//         </>
//     )
// }

const PostStatitics = (props: { date: string }) => {
	const date = timeSince(new Date(props.date).getTime());

	return (
		<>
			<div class={styles.postStats}>
				<p class={styles.date}>{date}</p>
			</div>
		</>
	);
};

/**
 * Converts a date object to human readable time since string. eg. "3 timmar sedan"
 * @param date - date object to convert
 * @returns - human readable time since date
 */
// function timeSince(date) {

//     var seconds = Math.floor((new Date() - date) / 1000);

//     var interval = seconds / 31536000;

//     if (interval > 1) {
//       return Math.floor(interval) + " år";
//     }
//     interval = seconds / 2592000;
//     if (interval > 1) {
//       return Math.floor(interval) + " månader";
//     }
//     interval = seconds / 86400;
//     if (interval > 1) {
//       return Math.floor(interval) + " dagar";
//     }
//     interval = seconds / 3600;
//     if (interval > 1) {
//       return Math.floor(interval) + " timmar";
//     }
//     interval = seconds / 60;
//     if (interval > 1) {
//       return Math.floor(interval) + " minuter";
//     }
//     return Math.floor(seconds) + " sekunder";
// }

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
// https://regexr.com/
function urlify(text: string) {
	var urlRegex =
		/(?<!\]\()(http:\/\/|https:\/\/)[a-zA-Z0-9._+-]+\.[a-z]+[a-zA-Z0-9\/._+-]+/g;
	return text.replace(urlRegex, function (url: string) {
		return `[${url.split("/")[2]}](${url})`;
	});
}
