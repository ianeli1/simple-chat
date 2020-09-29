import { Card, CardContent, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { ASElement, AvatarScroller } from "../components/AvatarScroller";
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

interface LandingProps {
  user: User | null;
  setCurrentServer: (serverId: string | null) => void;
}

export function Landing(props: LandingProps) {
  const friendList: ASElement[] = props.user
    ? props.user.friends?.map((name, key) => ({ key: String(key), name })) ||
      ([] as ASElement[])
    : [];
  const serverList: ASElement[] = props.user
    ? props.user.servers?.map((name, key) => ({ key: name, name })) || []
    : [];
  return (
    <div className="LandingRoot">
      <LandingCard title="Your servers">
        <AvatarScroller
          size={50}
          elements={serverList}
          onElementClick={props.setCurrentServer}
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
