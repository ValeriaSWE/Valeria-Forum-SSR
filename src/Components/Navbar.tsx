import { createSignal, Show } from "solid-js";
import { JSX } from "solid-js";
import styles from "./StylingModules/Navbar.module.css";
import $ from "jquery";
import { GetValeriaData } from "~/api/valeria";
import {
	createServerAction$,
	createServerData$,
} from "solid-start/server/data";
import {
	getUser,
	getUserPrefs,
	logout as svLogout,
	saveUserPrefs,
} from "~/lib/user.sever";
import { A, useLocation } from "solid-start";
import { darkmode, setDarkmode } from "~/root";
import { type } from "os";

export default function Navbar() {
	const location = useLocation();

	const user = createServerData$(async (_, { request }) => {
		const user = await getUser(request);

		return user;
	});

	const userPrefs = createServerData$(async (_, { request }) => {
		const userPrefs = await getUserPrefs(request);

		return userPrefs;
	});

	const [toggleResponsNav, setToggleResponsNav] = createSignal(false);
	const [open, setOpen] = createSignal("none");

	// function setDarkmode(lightModeOn: "on" | "off") {
	// 	// const userPrefs = createServerData$(async (_, { request }) => {
	// 	// 	const userPrefs = await getUserPrefs(request);

	// 	// 	return userPrefs;
	// 	// }); // localStorage.getItem('lightmode') == "off" ? "on" : "off" || "on"

	// 	// const lightModeOn = userPrefs()?.lightmode == "off" ? "on" : "off" || "on";

	// 	// if (!isServer) {
	// 	// 	$(":root").attr(
	// 	// 		"data-dark-mode",
	// 	// 		lightModeOn == "off" ? "true" : "false"
	// 	// 	);
	// 	// 	$("#dark-code-styling").attr(
	// 	// 		"disabled",
	// 	// 		(lightModeOn == "on").toString()
	// 	// 	);
	// 	// 	$("#light-code-styling").attr(
	// 	// 		"disabled",
	// 	// 		(lightModeOn == "off").toString()
	// 	// 	);
	// 	// }

	// 	SetWinDarkmode(lightModeOn == "off");

	// 	return lightModeOn;
	// 	// const savePrefs = createServerData$(async (_, { request }) => {
	// 	// 	saveUserPrefs({ lightmode: lightModeOn }, lo);
	// 	// })
	// 	// location.reload()
	// }
	// console.log(userPrefs()?.lightmode);
	// setDarkmode(userPrefs()?.lightmode == "on");

	function Nav(props: { children: JSX.Element }) {
		return (
			<>
				<nav class={styles.navbar + " " + "navbar"}>
					<ul class={styles.navbarNav}>{props.children}</ul>
				</nav>
			</>
		);
	}

	function NavBarLogo() {
		interface ImageProps {
			imgSrc: string;
		}

		const ImageLogo = (props: ImageProps) => {
			return (
				<>
					<img class={styles.navbarLogo} src={props.imgSrc} alt='Logo' />
				</>
			);
		};

		return (
			<>
				<A class={styles.logo} href='/'>
					<ImageLogo imgSrc='../../images/valeria.png' />
				</A>
			</>
		);
	}

	function NavBarLinks() {
		interface NavLinkProps {
			icon: JSX.Element;
			href: string;
		}

		const NavLink = (props: NavLinkProps) => {
			return (
				<>
					<li class={styles.navlink}>
						<A href={props.href || "#"} class={styles.linkbutton}>
							{props.icon}
						</A>
					</li>
				</>
			);
		};

		return (
			<>
				<ul class={styles.navbarlinks}>
					<NavLink icon='Flöde' href='/forum/feed'></NavLink>
					<NavLink icon='Butik' href='https://valeria.tebex.io/'></NavLink>
				</ul>
			</>
		);
	}

	function NavBarIcons() {
		const NavItem = (props: {
			children: JSX.Element;
			icon: JSX.Element;
			action: string;
			color?: "string";
		}) => {
			return (
				<>
					<li class={styles.navitem}>
						<a
							href='#'
							class={styles.iconbutton + " material-icons"}
							style={props.color ? "background-color: " + props.color : ""}
							id={props.action}
							onclick={() => {
								setOpen(open() == props.action ? "none" : props.action);
							}}
						>
							{props.icon === "profilePicture" ? (
								user() ? (
									<img src={user()?.pfp} class={styles.profilePicture}></img>
								) : (
									"person"
								)
							) : props.icon?.toString().endsWith(".png") ? (
								<img
									src={"../../images/" + props.icon}
									class={styles.profilePicture}
								></img>
							) : (
								props.icon
							)}
						</a>
						{open() == props.action && props.children}
					</li>
				</>
			);
		};

		function ProfileDropdownMenu() {
			const [mainDrop, SetMainDrop] = createSignal(true);

			interface DropdownItemProps {
				leftIcon: string;
				rightIcon: [string, number] | null;
				action: "logout" | "darkmode" | (() => void) | null;
				label: string;
			}

			interface DropdownItemPropsHref extends DropdownItemProps {
				href: string;
			}

			type DropdownItemPropsAll = DropdownItemProps | DropdownItemPropsHref;

			function DropdownItem(props: DropdownItemPropsAll) {
				if (typeof props.action === "string") {
					function submit() {
						if (props.action == "darkmode") {
							// console.log(userPrefs()?.lightmode);
							setDarkmode(userPrefs()?.lightmode == "off");
						}
					}
					const [, { Form: Form }] = createServerAction$(
						async (form: FormData, { request }) => {
							// console.log("logout");
							const loc = form.get("redirect") as string;
							const action = form.get("action") as string;
							// console.log(loc);
							// console.log(request.headers);
							switch (action) {
								case "logout":
									return svLogout(loc, request);
								case "darkmode":
									// console.log("darkmode");
									return saveUserPrefs(
										{ lightmode: form.get("lightmode") as string },
										loc,
										request
									);
							}
							// if (action == "logout") {
							// 	return svLogout(loc, request);
							// }
						}
					);

					const location = useLocation();

					return (
						<Form onSubmit={submit}>
							{props.action == "darkmode" ? (
								<input
									type='hidden'
									name='lightmode'
									value={darkmode() ? "on" : "off"}
								/>
							) : (
								<></>
							)}
							<input type='hidden' name='action' value={props.action} />
							<input
								type='hidden'
								name='redirect'
								value={location.pathname || "/forum"}
							/>
							<button class={styles.menuitem} id='menu-item' type='submit'>
								<span
									class={styles.iconbutton + " material-icons"}
									id='nav-item'
								>
									{props.leftIcon === "profilePicture" ? (
										<img src={user()?.pfp} class={styles.profilePicture}></img>
									) : (
										props.leftIcon
									)}
								</span>
								{props.label}
								<span
									class={styles.iconright + " material-icons"}
									id='nav-item'
									style={
										"font-size: " +
										(props.rightIcon ? props.rightIcon[1] : null) +
										"rem; color: white;"
									}
								>
									{props.rightIcon ? props.rightIcon[0] : null}
								</span>
							</button>
						</Form>
					);
				}
				return (
					<A
						href={props.href || "#"}
						class={styles.menuitem}
						id='menu-item'
						onclick={(e) => {
							try {
								if (typeof props.action == "function") {
									props.action();
								}
							} catch (err) {
								throw err;
							}
						}}
					>
						<span class={styles.iconbutton + " material-icons"} id='nav-item'>
							{props.leftIcon === "profilePicture" ? (
								<img src={user()?.pfp} class={styles.profilePicture}></img>
							) : (
								props.leftIcon
							)}
						</span>
						{props.label}
						<span
							class={styles.iconright + " material-icons"}
							id='nav-item'
							style={
								"font-size: " +
								(props.rightIcon ? props.rightIcon[1] : null) +
								"rem; color: white;"
							}
						>
							{props.rightIcon ? props.rightIcon[0] : null}
						</span>
					</A>
				);
			}

			const DropDownMain = () => {
				return (
					<>
						<DropdownItem
							label={user()?.username || "Profil"}
							leftIcon={"profilePicture"}
							rightIcon={null}
							action={() => setOpen("none")}
							href={"/forum/user/" + user()?._id}
						/>
						<DropdownItem
							label={"Inställningar"}
							leftIcon={"settings"}
							rightIcon={["arrow_forward_ios", 1.5]}
							action={() => SetMainDrop(!mainDrop())}
						/>
						<Show when={user()?.roleRank >= 10}>
							<DropdownItem
								label={"Admin Panel"}
								leftIcon={"admin_panel_settings"}
								rightIcon={null}
								action={() => setOpen("none")}
								href={"/admin"}
							/>
							<DropdownItem
								label={"DEV Panel"}
								leftIcon={"terminal"}
								rightIcon={null}
								action={() => setOpen("none")}
								href={"/dev"}
							/>
						</Show>
						<DropdownItem
							label={"Logga ut"}
							leftIcon={"logout"}
							rightIcon={null}
							action={"logout"}
						/>
					</>
				);
			};

			const DropDownSettings = () => {
				// Set to darkmode if darkmode is toggled in localstorage
				// if(localStorage.getItem('lightmode') == "off") {
				//   setDarkToggleModeIcon("toggle_on");
				//   setDarkModeIcon("dark_mode");
				//   setdarkModeLabel("Mörkt läge");
				// }

				return (
					<>
						<DropdownItem
							label={"Gå Tillbaka"}
							leftIcon={"arrow_back"}
							rightIcon={null}
							action={() => SetMainDrop(!mainDrop())}
						/>
						<DropdownItem
							label={darkmode() ? "Mörkt läge" : "Ljust läge"} //darkModeLabel()}
							leftIcon={darkmode() ? "dark_mode" : "light_mode"} //darkModeIcon()}
							rightIcon={[darkmode() ? "toggle_on" : "toggle_off", 3]}
							action={"darkmode"} //() => toggleDarkmode()}
						/>
						<DropdownItem
							label={"Inställning 2 "}
							leftIcon={"settings"}
							rightIcon={null}
							action={null}
						/>
						<DropdownItem
							label={"Inställning 3... "}
							leftIcon={"settings"}
							rightIcon={null}
							action={null}
						/>
					</>
				);
			};

			const DropDownLoggedOut = () => {
				return (
					<>
						<DropdownItem
							label={"Inställningar"}
							leftIcon={"settings"}
							rightIcon={["arrow_forward_ios", 1.5]}
							action={() => SetMainDrop(!mainDrop())}
						/>
						<DropdownItem
							label={"Logga in"}
							leftIcon={"login"}
							rightIcon={null}
							action={null /*setShowLogin(!showLogin())*/}
							href={"/forum/login?redirect=" + location.pathname}
						/>
						<DropdownItem
							label={"Registrera Konto"}
							leftIcon={"person_add"}
							rightIcon={null}
							action={null /*setShowRegister(!showRegister())*/}
							href={"/forum/register?redirect=" + location.pathname}
						/>
					</>
				);
			};

			return (
				<>
					<div class={styles.dropdown} id='dropdown'>
						<Show when={mainDrop()} fallback={<DropDownSettings />}>
							<Show when={user()} fallback={<DropDownLoggedOut />}>
								<DropDownMain />
							</Show>
						</Show>
					</div>
				</>
			);
		}

		const NavItemLoggedOut = (props: {
			leftIcon: string;
			label: string;
			action: any;
		}) => {
			return (
				<div
					class={styles.navbariconsLoggedOut + " " + "NavAccountBtn"}
					onClick={() => {
						try {
							props.action;
						} catch (err) {
							throw err;
						}
					}}
				>
					<i class='material-icons'>{props.leftIcon}</i>
					<p>{props.label}</p>
				</div>
			);
		};

		return (
			<>
				<ul class={styles.navbaricons}>
					<div>
						{/* <Show when={loggedIn} fallback={
            <> 
              <NavItemLoggedOut leftIcon={"login"} label={"Logga in"} action={setShowLogin(!showLogin())} />
              <NavItemLoggedOut leftIcon={"person_add"} label={"Registera konto"} action={setShowRegister(!showRegister())} />
            </>
          }> */}
						{/* <NavItem action={null} icon={"chat"} children={null} /> 
            <NavItem action={null} icon={"notifications"} children={null}/> */}
						<NavItem
							action={"status"}
							icon={"valeria.png"}
							color={serverData() ? "green" : "red"}
						>
							<div class={styles.dropdown} id='dropdown'>
								<ValeriaServerInfo />
							</div>
						</NavItem>
						<NavItem action={"profile"} icon={"profilePicture"}>
							<ProfileDropdownMenu></ProfileDropdownMenu>
						</NavItem>
						{/* </Show> */}
					</div>
				</ul>
			</>
		);
	}

	const [serverData, setServerData] = createSignal(null);
	GetValeriaData().then((res) => {
		setServerData(res.data);
	});
	function ValeriaServerInfo() {
		return (
			<div style='color: white'>
				<h1 style='color: white'>Valeria Server Status:</h1>
				<Show
					when={serverData()}
					fallback={<p style='color: white'>Servern är offline! : (</p>}
				>
					<p style='color: white'>Servern är online! : )</p>
					<p style='color: white'>Spelare: {serverData().players}</p>
					<p style='color: white'>Poliser: {serverData().cops}</p>
				</Show>
			</div>
		);
	}

	function HamburgerIcon() {
		// class={styles.menuicon + styles.checkbox3}
		return (
			<>
				<div class={styles.menuicon}>
					<input
						type='checkbox'
						id='checkbox3'
						class={styles.checkbox3 + " " + styles.visuallyHidden}
						onclick={() => {
							clearInterval(toggleNavbar);
							if (toggleResponsNav()) {
								// var x:HTMLElement | any = document.getElementById("responsivenavmenu");
								var toggleNavbar: any = setTimeout(() => {
									setToggleResponsNav(!toggleResponsNav());
								}, 450);
								// x.style.height = "0";
								// x.style.opacity = "0";
							} else {
								setToggleResponsNav(!toggleResponsNav());
							}
						}}
					/>
					<label for='checkbox3'>
						<div class={styles.hamburger + " " + styles.hamburger3}>
							<span class={styles.bar + " " + styles.bar1}></span>
							<span class={styles.bar + " " + styles.bar4}></span>
						</div>
					</label>
				</div>
			</>
		);
	}

	function NavbarResponsive() {
		return (
			<>
				<div class={styles.responsiveDropDown} id='responsivenavmenu'>
					<ul class={styles.resposniveListItems}>
						<li>
							<A href='#'>....</A>
						</li>
						<li>
							<A href='#'>...s</A>
						</li>
						<li>
							<A href='#'>...</A>
						</li>
						<li>
							<A href='#'>...</A>
						</li>
						<li>
							<A href='#'>...</A>
						</li>
					</ul>
				</div>
			</>
		);
	}

	var [changeToMobile, setchangeToMobile] = createSignal(false);
	// function checkWidth() {
	//   var newWidth = window.innerWidth;
	//   if(newWidth <= 1100) {
	//     setchangeToMobile(true);

	//   }
	//   else { setchangeToMobile(false);

	//   }
	// }

	// window.addEventListener('load', () => {
	//   checkWidth()
	// })

	// window.addEventListener('resize', () => {
	//   checkWidth()
	// });

	// close modal on esc
	// $(document).ready(function() {
	//   $("body").keydown(function(event) {
	//       if(event.which == 27) {
	//         if(showRegister()) { setShowRegister(!showRegister())}
	//         if(showLogin()) { setShowLogin(!showLogin())}
	//         // document.querySelector("body").style.overflow = "auto";
	//       }
	//   });
	// });

	return (
		<>
			<Nav>
				<NavBarLogo />
				<NavBarLinks />
				<NavBarIcons />
				<Show when={toggleResponsNav() && changeToMobile()}>
					<NavbarResponsive />
				</Show>
				<HamburgerIcon />
			</Nav>
			{/* <Show when={showRegister()}>
				{setShowLogin(false)}
				<Register cancel={() => setShowRegister(false)} />
			</Show>
			<Show when={showLogin()}>
				{setShowRegister(false)}
				<Login cancel={() => setShowLogin(false)} />
			</Show> */}
		</>
	);
}
