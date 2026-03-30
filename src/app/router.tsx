import { createBrowserRouter } from "react-router-dom";
import { routes } from "../shared/constants/routes";
import { AppShell } from "./layout/AppShell";
import { ApprovalPage } from "../screens/ApprovalPage/ApprovalPage";
import { DealCanvasPage } from "../screens/DealCanvasPage/DealCanvasPage";
import { DealInboxPage } from "../screens/DealInboxPage/DealInboxPage";
import { IntelligencePage } from "../screens/IntelligencePage/IntelligencePage";
import { NegotiationPage } from "../screens/NegotiationPage/NegotiationPage";
import { PortfolioPage } from "../screens/PortfolioPage/PortfolioPage";
import { RiskAlertPage } from "../screens/RiskAlertPage/RiskAlertPage";
import { TopPage } from "../screens/TopPage/TopPage";
import { WorldMapPage } from "../screens/WorldMapPage/WorldMapPage";
import { YearEndPage } from "../screens/YearEndPage/YearEndPage";

export const router = createBrowserRouter([
  {
    path: routes.top,
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <TopPage />
      },
      {
        path: routes.newGame,
        element: <TopPage />
      },
      {
        path: routes.map,
        element: <WorldMapPage />
      },
      {
        path: routes.intelligence,
        element: <IntelligencePage />
      },
      {
        path: routes.inbox,
        element: <DealInboxPage />
      },
      {
        path: "/play/deal/:dealId",
        element: <DealCanvasPage />
      },
      {
        path: "/play/negotiation/:sessionId",
        element: <NegotiationPage />
      },
      {
        path: "/play/approval/:dealId",
        element: <ApprovalPage />
      },
      {
        path: routes.portfolio,
        element: <PortfolioPage />
      },
      {
        path: "/play/risk/:incidentId",
        element: <RiskAlertPage />
      },
      {
        path: routes.yearEnd,
        element: <YearEndPage />
      }
    ]
  }
]);
