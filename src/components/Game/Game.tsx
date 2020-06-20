import Peer from "peerjs";
import React, { useEffect } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router-dom";

const heroes = [
  { name: "Abaddon", url: "Abaddon_minimap_icon.png" },
  { name: "Alchemist", url: "Alchemist_minimap_icon.png" },
  { name: "Ancient Apparition", url: "Ancient_Apparition_minimap_icon.png" },
  { name: "Anti Mage", url: "Anti-Mage_minimap_icon.png" },
  { name: "Arc Warden", url: "Arc_Warden_minimap_icon.png" },
  { name: "Axe", url: "Axe_minimap_icon.png" },
  { name: "Bane", url: "Bane_minimap_icon.png" },
  { name: "Batrider", url: "Batrider_minimap_icon.png" },
  { name: "Beastmaster", url: "Beastmaster_minimap_icon.png" },
  { name: "Bloodseeker", url: "Bloodseeker_minimap_icon.png" },
  { name: "Bounty Hunter", url: "Bounty_Hunter_minimap_icon.png" },
  { name: "Brewmaster", url: "Brewmaster_minimap_icon.png" },
  { name: "Bristleback", url: "Bristleback_minimap_icon.png" },
  { name: "Broodmother", url: "Broodmother_minimap_icon.png" },
  { name: "Centaur Warrunner", url: "Centaur_Warrunner_minimap_icon.png" },
  { name: "Chaos Knight", url: "Chaos_Knight_minimap_icon.png" },
  { name: "Chen", url: "Chen_minimap_icon.png" },
  { name: "Clinkz", url: "Clinkz_minimap_icon.png" },
  { name: "Clockwerk", url: "Clockwerk_minimap_icon.png" },
  { name: "Crystal Maiden", url: "Crystal_Maiden_minimap_icon.png" },
  { name: "Dark Seer", url: "Dark_Seer_minimap_icon.png" },
  { name: "Dark Willow", url: "Dark_Willow_minimap_icon.png" },
  { name: "Dazzle", url: "Dazzle_minimap_icon.png" },
  { name: "Death Prophet", url: "Death_Prophet_minimap_icon.png" },
  { name: "Disruptor", url: "Disruptor_minimap_icon.png" },
  { name: "Doom", url: "Doom_minimap_icon.png" },
  { name: "Dragon Knight", url: "Dragon_Knight_minimap_icon.png" },
  { name: "Drow Ranger", url: "Drow_Ranger_minimap_icon.png" },
  { name: "Earth Spirit", url: "Earth_Spirit_minimap_icon.png" },
  { name: "Earthshaker", url: "Earthshaker_minimap_icon.png" },
  { name: "Elder Titan", url: "Elder_Titan_minimap_icon.png" },
  { name: "Ember Spirit", url: "Ember_Spirit_minimap_icon.png" },
  { name: "Enchantress", url: "Enchantress_minimap_icon.png" },
  { name: "Enigma", url: "Enigma_minimap_icon.png" },
  { name: "Faceless Void", url: "Faceless_Void_minimap_icon.png" },
  { name: "Grimstroke", url: "Grimstroke_minimap_icon.png" },
  { name: "Gyrocopter", url: "Gyrocopter_minimap_icon.png" },
  { name: "Huskar", url: "Huskar_minimap_icon.png" },
  { name: "Invoker", url: "Invoker_minimap_icon.png" },
  { name: "Io", url: "Io_minimap_icon.png" },
  { name: "Jakiro", url: "Jakiro_minimap_icon.png" },
  { name: "Juggernaut", url: "Juggernaut_minimap_icon.png" },
  { name: "Keeper of the Light", url: "Keeper_of_the_Light_minimap_icon.png" },
  { name: "Kunkka", url: "Kunkka_minimap_icon.png" },
  { name: "Legion Commander", url: "Legion_Commander_minimap_icon.png" },
  { name: "Leshrac", url: "Leshrac_minimap_icon.png" },
  { name: "Lich", url: "Lich_minimap_icon.png" },
  { name: "Lifestealer", url: "Lifestealer_minimap_icon.png" },
  { name: "Lina", url: "Lina_minimap_icon.png" },
  { name: "Lion", url: "Lion_minimap_icon.png" },
  { name: "Lone Druid", url: "Lone_Druid_minimap_icon.png" },
  { name: "Luna", url: "Luna_minimap_icon.png" },
  { name: "Lycan", url: "Lycan_minimap_icon.png" },
  { name: "Magnus", url: "Magnus_minimap_icon.png" },
  { name: "Mars", url: "Mars_minimap_icon.png" },
  { name: "Medusa", url: "Medusa_minimap_icon.png" },
  { name: "Meepo", url: "Meepo_minimap_icon.png" },
  { name: "Mirana", url: "Mirana_minimap_icon.png" },
  { name: "Monkey King", url: "Monkey_King_minimap_icon.png" },
  { name: "Morphling", url: "Morphling_minimap_icon.png" },
  { name: "Naga Siren", url: "Naga_Siren_minimap_icon.png" },
  { name: "Nature's Prophet", url: "Nature%2527s_Prophet_minimap_icon.png" },
  { name: "Necrophos", url: "Necrophos_minimap_icon.png" },
  { name: "Night Stalker", url: "Night_Stalker_minimap_icon.png" },
  { name: "Nyx Assassin", url: "Nyx_Assassin_minimap_icon.png" },
  { name: "Ogre Magi", url: "Ogre_Magi_minimap_icon.png" },
  { name: "Omniknight", url: "Omniknight_minimap_icon.png" },
  { name: "Oracle", url: "Oracle_minimap_icon.png" },
  { name: "Outworld Devourer", url: "Outworld_Devourer_minimap_icon.png" },
  { name: "Pangolier", url: "Pangolier_minimap_icon.png" },
  { name: "Phantom Assassin", url: "Phantom_Assassin_minimap_icon.png" },
  { name: "Phantom Lancer", url: "Phantom_Lancer_minimap_icon.png" },
  { name: "Phoenix", url: "Phoenix_minimap_icon.png" },
  { name: "Puck", url: "Puck_minimap_icon.png" },
  { name: "Pudge", url: "Pudge_minimap_icon.png" },
  { name: "Pugna", url: "Pugna_minimap_icon.png" },
  { name: "Queen of Pain", url: "Queen_of_Pain_minimap_icon.png" },
  { name: "Razor", url: "Razor_minimap_icon.png" },
  { name: "Riki", url: "Riki_minimap_icon.png" },
  { name: "Rubick", url: "Rubick_minimap_icon.png" },
  { name: "Sand King", url: "Sand_King_minimap_icon.png" },
  { name: "Shadow Demon", url: "Shadow_Demon_minimap_icon.png" },
  { name: "Shadow Fiend", url: "Shadow_Fiend_minimap_icon.png" },
  { name: "Shadow Shaman", url: "Shadow_Shaman_minimap_icon.png" },
  { name: "Silencer", url: "Silencer_minimap_icon.png" },
  { name: "Skeleton King", url: "Skeleton_King_minimap_icon.png" },
  { name: "Skywrath Mage", url: "Skywrath_Mage_minimap_icon.png" },
  { name: "Slardar", url: "Slardar_minimap_icon.png" },
  { name: "Slark", url: "Slark_minimap_icon.png" },
  { name: "Snapfire", url: "Snapfire_minimap_icon.png" },
  { name: "Sniper", url: "Sniper_minimap_icon.png" },
  { name: "Spectre", url: "Spectre_minimap_icon.png" },
  { name: "Spirit Breaker", url: "Spirit_Breaker_minimap_icon.png" },
  { name: "Storm Spirit", url: "Storm_Spirit_minimap_icon.png" },
  { name: "Sven", url: "Sven_minimap_icon.png" },
  { name: "Techies", url: "Techies_minimap_icon.png" },
  { name: "Templar Assassin", url: "Templar_Assassin_minimap_icon.png" },
  { name: "Terrorblade", url: "Terrorblade_minimap_icon.png" },
  { name: "Tidehunter", url: "Tidehunter_minimap_icon.png" },
  { name: "Timbersaw", url: "Timbersaw_minimap_icon.png" },
  { name: "Tinker", url: "Tinker_minimap_icon.png" },
  { name: "Tiny", url: "Tiny_minimap_icon.png" },
  { name: "Treant Protector", url: "Treant_Protector_minimap_icon.png" },
  { name: "Troll Warlord", url: "Troll_Warlord_minimap_icon.png" },
  { name: "Tusk", url: "Tusk_minimap_icon.png" },
  { name: "Underlord", url: "Underlord_minimap_icon.png" },
  { name: "Undying", url: "Undying_minimap_icon.png" },
  { name: "Ursa", url: "Ursa_minimap_icon.png" },
  { name: "Vengeful Spirit", url: "Vengeful_Spirit_minimap_icon.png" },
  { name: "Venomancer", url: "Venomancer_minimap_icon.png" },
  { name: "Viper", url: "Viper_minimap_icon.png" },
  { name: "Visage", url: "Visage_minimap_icon.png" },
  { name: "Void Spirit", url: "Void_Spirit_minimap_icon.png" },
  { name: "Warlock", url: "Warlock_minimap_icon.png" },
  { name: "Weaver", url: "Weaver_minimap_icon.png" },
  { name: "Windranger", url: "Windranger_minimap_icon.png" },
  { name: "Winter Wyvern", url: "Winter_Wyvern_minimap_icon.png" },
  { name: "Witch Doctor", url: "Witch_Doctor_minimap_icon.png" },
  { name: "Wraith King", url: "Wraith_King_minimap_icon.png" },
  { name: "Zeus", url: "Zeus_minimap_icon.png" },
];

function Game(): JSX.Element {
  const { sessionId } = useParams();

  const playerName = localStorage.getItem("playerName");
  const userId = `${sessionId}_${playerName}`;

  let peerToConnectTo = "";
  if (playerName === "Michael") {
    peerToConnectTo = `${sessionId}_Swag`;
  } else {
    peerToConnectTo = `${sessionId}_Michael`;
  }

  const currentHeroes = [
    [32, 63, 34, 118, 43, 38, 17, 91, 96, 5, 93, 79],
    [8, 15, 111, 95, 11, 20, 62, 65, 113, 115, 69, 53],
    [55, 104, 37, 19, 112, 81, 56, 74, 33, 27, 29, 70],
    [82, 114, 50, 107, 13, 16, 39, 90, 57, 100, 40, 4],
    // [117, 18, 68, 41, 103, 109, 73, 71, 25, 52, 86, 30],
    // [6, 77, 110, 7, 46, 72, 61, 9, 99, 119, 21, 45],
    // [47, 22, 49, 78, 67, 2, 80, 101, 88, 66, 97, 1],
    // [51, 116, 108, 44, 98, 12, 28, 75, 26, 60, 35, 105],
    // [48, 83, 64, 94, 58, 10, 3, 84, 42, 14, 59, 102],
  ];

  let conn: Peer.DataConnection;

  useEffect(() => {
    console.log("sessionId", sessionId);
    console.log("userId", userId);

    const peer = new Peer(userId, {
      host: "localhost",
      port: 9000,
      path: "/play",
    });

    peer.on("open", () => {
      console.log("peer open");
      if (playerName === "Swag") {
        conn = peer.connect(peerToConnectTo);

        conn.on("open", () => {
          console.log("sending hello");
          conn.send("hi!");
        });
        conn.on("data", (data) => {
          console.log(data);
        });

        conn.on("error", (err) => {
          console.log("connection error", err);
        });
      }
    });

    peer.on("connection", (incomingConn) => {
      incomingConn.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
      incomingConn.on("open", () => {
        incomingConn.send("hello!");
      });
      conn = incomingConn;
    });

    peer.on("error", (err) => {
      console.log("peer connection error", err);
    });
    // client = new W3CWebSocket("ws://127.0.0.1:8000");
    // client.onopen = () => {
    //   console.log("WebSocket Client Connected");
    //   // Let server know the client's player name
    //   client.send(
    //     JSON.stringify({
    //       sessionId: sessionId,
    //       name: playerName,
    //       type: "connection",
    //     })
    //   );
    // };
    // client.onmessage = (message) => {
    //   console.log(message);
    //   const dataFromServer = JSON.parse(message.data as string);
    //   const stateToChange: any = {};
    //   if (dataFromServer.type === "playeraction") {
    //     console.log("update from", dataFromServer.data.from);
    //     console.log("update data", dataFromServer.data.update);
    //   }
    //   if (dataFromServer.type === "gameevent") {
    //     stateToChange.currentUsers = Object.values(dataFromServer.data.users);
    //   } else if (dataFromServer.type === "contentchange") {
    //     stateToChange.text = dataFromServer.data.editorContent;
    //   }
    //   stateToChange.userActivity = dataFromServer.data.userActivity;
    // };
  });

  function appendUrl(heroString: string): string {
    return `https://dota-hero-minimap-icons.s3.amazonaws.com/${heroString}`;
  }

  function handleClick(hero: number) {
    console.log("clicked", hero);
    conn.send(`network event clicked ${hero}`);
  }

  function createHeroImagesRow(rowNumber: number): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < currentHeroes[rowNumber].length; i++) {
      heroImagesRow.push(
        <img
          src={appendUrl(heroes[currentHeroes[rowNumber][i]].url)}
          onClick={() => handleClick(currentHeroes[rowNumber][i])}
        ></img>
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < currentHeroes.length; i++) {
      heroImages.push(
        <Row>
          <Col>{createHeroImagesRow(i)}</Col>
        </Row>
      );
    }
    return heroImages;
  }

  return (
    <Container>
      <Row>
        <Col>{createHeroImages()}</Col>
      </Row>
    </Container>
  );
}

export default Game;
