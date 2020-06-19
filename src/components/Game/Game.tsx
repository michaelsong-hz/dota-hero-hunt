import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

const heroes = {
  Abaddon: "Abaddon_minimap_icon.png",
  Alchemist: "Alchemist_minimap_icon.png",
  "Ancient Apparition": "Ancient_Apparition_minimap_icon.png",
  "Anti Mage": "Anti-Mage_minimap_icon.png",
  "Arc Warden": "Arc_Warden_minimap_icon.png",
  Axe: "Axe_minimap_icon.png",
  Bane: "Bane_minimap_icon.png",
  Batrider: "Batrider_minimap_icon.png",
  Beastmaster: "Beastmaster_minimap_icon.png",
  Bloodseeker: "Bloodseeker_minimap_icon.png",
  "Bounty Hunter": "Bounty_Hunter_minimap_icon.png",
  Brewmaster: "Brewmaster_minimap_icon.png",
  Bristleback: "Bristleback_minimap_icon.png",
  Broodmother: "Broodmother_minimap_icon.png",
  "Centaur Warrunner": "Centaur_Warrunner_minimap_icon.png",
  "Chaos Knight": "Chaos_Knight_minimap_icon.png",
  Chen: "Chen_minimap_icon.png",
  Clinkz: "Clinkz_minimap_icon.png",
  Clockwerk: "Clockwerk_minimap_icon.png",
  "Crystal Maiden": "Crystal_Maiden_minimap_icon.png",
  "Dark Seer": "Dark_Seer_minimap_icon.png",
  "Dark Willow": "Dark_Willow_minimap_icon.png",
  Dazzle: "Dazzle_minimap_icon.png",
  "Death Prophet": "Death_Prophet_minimap_icon.png",
  Disruptor: "Disruptor_minimap_icon.png",
  Doom: "Doom_minimap_icon.png",
  "Dragon Knight": "Dragon_Knight_minimap_icon.png",
  "Drow Ranger": "Drow_Ranger_minimap_icon.png",
  "Earth Spirit": "Earth_Spirit_minimap_icon.png",
  Earthshaker: "Earthshaker_minimap_icon.png",
  "Elder Titan": "Elder_Titan_minimap_icon.png",
  "Ember Spirit": "Ember_Spirit_minimap_icon.png",
  Enchantress: "Enchantress_minimap_icon.png",
  Enigma: "Enigma_minimap_icon.png",
  "Faceless Void": "Faceless_Void_minimap_icon.png",
  Grimstroke: "Grimstroke_minimap_icon.png",
  Gyrocopter: "Gyrocopter_minimap_icon.png",
  Huskar: "Huskar_minimap_icon.png",
  Invoker: "Invoker_minimap_icon.png",
  Io: "Io_minimap_icon.png",
  Jakiro: "Jakiro_minimap_icon.png",
  Juggernaut: "Juggernaut_minimap_icon.png",
  "Keeper of the Light": "Keeper_of_the_Light_minimap_icon.png",
  Kunkka: "Kunkka_minimap_icon.png",
  "Legion Commander": "Legion_Commander_minimap_icon.png",
  Leshrac: "Leshrac_minimap_icon.png",
  Lich: "Lich_minimap_icon.png",
  Lifestealer: "Lifestealer_minimap_icon.png",
  Lina: "Lina_minimap_icon.png",
  Lion: "Lion_minimap_icon.png",
  "Lone Druid": "Lone_Druid_minimap_icon.png",
  Luna: "Luna_minimap_icon.png",
  Lycan: "Lycan_minimap_icon.png",
  Magnus: "Magnus_minimap_icon.png",
  Mars: "Mars_minimap_icon.png",
  Medusa: "Medusa_minimap_icon.png",
  Meepo: "Meepo_minimap_icon.png",
  Mirana: "Mirana_minimap_icon.png",
  "Monkey King": "Monkey_King_minimap_icon.png",
  Morphling: "Morphling_minimap_icon.png",
  "Naga Siren": "Naga_Siren_minimap_icon.png",
  "Nature's Prophet": "Nature%27s_Prophet_minimap_icon.png",
  Necrophos: "Necrophos_minimap_icon.png",
  "Night Stalker": "Night_Stalker_minimap_icon.png",
  "Nyx Assassin": "Nyx_Assassin_minimap_icon.png",
  "Ogre Magi": "Ogre_Magi_minimap_icon.png",
  Omniknight: "Omniknight_minimap_icon.png",
  Oracle: "Oracle_minimap_icon.png",
  "Outworld Devourer": "Outworld_Devourer_minimap_icon.png",
  Pangolier: "Pangolier_minimap_icon.png",
  "Phantom Assassin": "Phantom_Assassin_minimap_icon.png",
  "Phantom Lancer": "Phantom_Lancer_minimap_icon.png",
  Phoenix: "Phoenix_minimap_icon.png",
  Puck: "Puck_minimap_icon.png",
  Pudge: "Pudge_minimap_icon.png",
  Pugna: "Pugna_minimap_icon.png",
  "Queen of Pain": "Queen_of_Pain_minimap_icon.png",
  Razor: "Razor_minimap_icon.png",
  Riki: "Riki_minimap_icon.png",
  Rubick: "Rubick_minimap_icon.png",
  "Sand King": "Sand_King_minimap_icon.png",
  "Shadow Demon": "Shadow_Demon_minimap_icon.png",
  "Shadow Fiend": "Shadow_Fiend_minimap_icon.png",
  "Shadow Shaman": "Shadow_Shaman_minimap_icon.png",
  Silencer: "Silencer_minimap_icon.png",
  "Skeleton King": "Skeleton_King_minimap_icon.png",
  "Skywrath Mage": "Skywrath_Mage_minimap_icon.png",
  Slardar: "Slardar_minimap_icon.png",
  Slark: "Slark_minimap_icon.png",
  Snapfire: "Snapfire_minimap_icon.png",
  Sniper: "Sniper_minimap_icon.png",
  Spectre: "Spectre_minimap_icon.png",
  "Spirit Breaker": "Spirit_Breaker_minimap_icon.png",
  "Storm Spirit": "Storm_Spirit_minimap_icon.png",
  Sven: "Sven_minimap_icon.png",
  Techies: "Techies_minimap_icon.png",
  "Templar Assassin": "Templar_Assassin_minimap_icon.png",
  Terrorblade: "Terrorblade_minimap_icon.png",
  Tidehunter: "Tidehunter_minimap_icon.png",
  Timbersaw: "Timbersaw_minimap_icon.png",
  Tinker: "Tinker_minimap_icon.png",
  Tiny: "Tiny_minimap_icon.png",
  "Treant Protector": "Treant_Protector_minimap_icon.png",
  "Troll Warlord": "Troll_Warlord_minimap_icon.png",
  Tusk: "Tusk_minimap_icon.png",
  Underlord: "Underlord_minimap_icon.png",
  Undying: "Undying_minimap_icon.png",
  Ursa: "Ursa_minimap_icon.png",
  "Vengeful Spirit": "Vengeful_Spirit_minimap_icon.png",
  Venomancer: "Venomancer_minimap_icon.png",
  Viper: "Viper_minimap_icon.png",
  Visage: "Visage_minimap_icon.png",
  "Void Spirit": "Void_Spirit_minimap_icon.png",
  Warlock: "Warlock_minimap_icon.png",
  Weaver: "Weaver_minimap_icon.png",
  Windranger: "Windranger_minimap_icon.png",
  "Winter Wyvern": "Winter_Wyvern_minimap_icon.png",
  "Witch Doctor": "Witch_Doctor_minimap_icon.png",
  "Wraith King": "Wraith_King_minimap_icon.png",
  Zeus: "Zeus_minimap_icon.png",
};
const heroesSubset = {
  Abaddon: "Abaddon_minimap_icon.png",
  Alchemist: "Alchemist_minimap_icon.png",
  "Ancient Apparition": "Ancient_Apparition_minimap_icon.png",
  "Anti Mage": "Anti-Mage_minimap_icon.png",
  "Arc Warden": "Arc_Warden_minimap_icon.png",
  Axe: "Axe_minimap_icon.png",
};

class Game extends React.Component {
  appendUrl(hero_string: string): string {
    return `https://dota-hero-minimap-icons.s3.amazonaws.com/${hero_string}`;
  }

  handleClick(hero: string) {
    console.log("clicked", hero);
  }

  createHeroImagesRow(): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];
    for (const [heroName, heroUrl] of Object.entries(heroesSubset)) {
      heroImagesRow.push(
        <img
          src={this.appendUrl(heroUrl)}
          onClick={() => this.handleClick(heroName)}
        ></img>
      );
    }
    return heroImagesRow;
  }

  createHeroImages(): JSX.Element[] {
    const rowsToGenerate = 5;
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < rowsToGenerate; i++) {
      heroImages.push(
        <Row>
          <Col>{this.createHeroImagesRow()}</Col>
        </Row>
      );
    }
    return heroImages;
  }

  render(): JSX.Element {
    return (
      <Container>
        <Row>
          <Col>{this.createHeroImages()}</Col>
        </Row>
      </Container>
    );
  }
}

export default Game;
