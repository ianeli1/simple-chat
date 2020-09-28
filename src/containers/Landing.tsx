import { Card, CardContent, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { ASElement, AvatarScroller } from "../components/AvatarScroller";
import { dataContext, loadServer } from "../components/Intermediary";
import "../css/Landing.css";

interface LandingCardProps {
  title: string;
  children: React.ReactNode;
}

function LandingCard(props: LandingCardProps) {
  return (
    <Card className="LandingCard">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {props.title}
        </Typography>
        <div className="LandingCardContainer">{props.children}</div>
      </CardContent>
    </Card>
  );
}

function useLanding() {
  const [state] = useContext(dataContext);
  const [user, setUser] = useState<User | null>(null);
  const [serverList, setServerList] = useState<ASElement[]>([]);
  useEffect(() => {
    const curr = state.misc.user;
    if (curr) {
      setUser(curr);
    } else setUser(null);
  }, [state.misc.user]);

  useEffect(() => {
    setServerList(
      Object.entries(state.servers).map(([key, server]) => ({
        key,
        name: server.data?.name || "",
        icon: server.data?.icon || undefined,
      }))
    );
  }, [state]); //TODO: this is gonna rerender with every single update, fix

  return { user, serverList };
}

export function Landing() {
  const { user, serverList } = useLanding();
  const friendList: ASElement[] =
    user?.friends?.map((name, key) => ({ key: String(key), name })) ||
    ([] as ASElement[]);
  return (
    <div className="LandingRoot">
      <LandingCard title="Your servers">
        <AvatarScroller
          size={50}
          elements={serverList}
          onElementClick={loadServer}
        />
      </LandingCard>

      <LandingCard title="Public servers">
        <Typography variant="h4" color="textPrimary">
          Coming soon...
        </Typography>
      </LandingCard>

      <LandingCard title="Your friends">
        <AvatarScroller
          size={50}
          elements={friendList}
          onElementClick={() => void null}
        />
      </LandingCard>
    </div>
  );
}
