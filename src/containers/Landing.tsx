import { Card, CardContent, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { AvatarScroller } from "../components/AvatarScroller";
import { currentContext, userContext } from "../components/Intermediary";
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

interface LandingProps {}

export function Landing(props: LandingProps) {
  const { setCurrentServer } = useContext(currentContext);
  const { user } = useContext(userContext);

  const friendList: ASElement[] = user
    ? user.friends?.map((name, key) => ({ key: String(key), name })) ||
      ([] as ASElement[])
    : [];
  const serverList: ASElement[] = user
    ? user.servers?.map((name) => ({ key: name, name })) || []
    : [];
  return (
    <div className="LandingRoot">
      <LandingCard title="Your servers">
        <AvatarScroller
          size={50}
          elements={serverList}
          onElementClick={setCurrentServer}
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
