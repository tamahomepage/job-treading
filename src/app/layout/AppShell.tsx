import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { routes } from "../../shared/constants/routes";
import { ContextRail } from "./ContextRail";
import { GlobalHud } from "./GlobalHud";
import styles from "./AppShell.module.css";

const navItems = [
  { label: "Map", to: routes.map },
  { label: "Intel", to: routes.intelligence },
  { label: "Inbox", to: routes.inbox },
  { label: "Portfolio", to: routes.portfolio },
  { label: "Year End", to: routes.yearEnd }
];

export function AppShell() {
  const location = useLocation();
  const isPlayRoute = location.pathname.startsWith("/play");

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link className={styles.brand} to={routes.top}>
            <span className={styles.brandTitle}>Global Value Architect</span>
            <span className={styles.brandSub}>総合商社シミュレーション</span>
          </Link>

          {isPlayRoute ? (
            <nav className={styles.nav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <div className={styles.body}>
        {isPlayRoute ? (
          <div className="stack">
            <GlobalHud />
            <div className={styles.playLayout}>
              <main className={styles.main}>
                <Outlet />
              </main>
              <aside className={styles.rail}>
                <ContextRail />
              </aside>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
