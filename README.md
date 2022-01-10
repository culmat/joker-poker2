## <img src="https://codeberg.org/culmat/joker-poker/raw/branch/main/public/joker-poker-logo.svg" align="left" height="48" width="48" >
Joker Poker

... is a distributed online [estimation poker](https://en.wikipedia.org/wiki/Planning_poker) application crafted with ❤️.

**How it works**

There are two important screens ...

1) The ![](https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/People/SVG/ic_fluent_people_20_filled.svg) _Team Estimate_ screen shows all team mates and their estimates, including yourself
1) The ![](https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Person/SVG/ic_fluent_person_20_filled.svg) _My Estimate_ screen shows your estimate and allows you to change it

and two important events ...

1) The _team starts estimating_ - all estimates are reset and hidden and all team mates are taken to the _My Estimate_ screen
1) _All team mates have estimated_ - all estimates are revealed and all team mates are taken to the _Team Estimate_ screen, you can still change your estimate
 
You can change between screens any time by clicking on your own estimate or via the menu.
If any teammate presses _Reset_ the _team starts estimating_.

To make sure JokerPoker correctly detects that _all team mates have estimated_ set yourself as _observer_ when you are not estimating. You can do so from the ![](https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/Person%20Settings/SVG/ic_fluent_person_settings_20_filled.svg) _My Settings_ screen

If needed a teammate can be made an _observer_ be anybody under ![](https://raw.githubusercontent.com/microsoft/fluentui-system-icons/master/assets/People%20Settings/SVG/ic_fluent_people_settings_20_filled.svg) _Team Settings_. 

**Features**

 * super easy to use - no fluff, just planning poker
 * no login, minimal setup - <a href="https://joker-poker.onrender.com/"><img src="https://dabuttonfactory.com/button.png?t=create+a+team&f=Ubuntu&ts=14&tc=fff&hp=16&vp=5&c=6&bgt=unicolored&bgc=2ea44f&be=1"></a> with a single click
 * mobile friendly - including integrated ![](https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/qrcode.svg) QR code generator 
 * data privacy - in the spirit of [unhosted](https://unhosted.org/), Joker Poker is as *serverless* as possible
   * all data is only stored locally in each participants browser
   * The [Yjs websocket connector](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket) is only used for communication between participants (NAT traversal)
   * We maintain [an instance on glitch ](https://glitch.com/edit/#!/private-mango-chili) that uses an [unmodified fork of the Yjs socket connector](https://github.com/culmat/y-websocket). If you don't trust us, host your own service.
 * optional [gravatar/monsterID](https://gravatar.com/) integration to make your poker session a friendly place
 * super robust technology - it is built on Yjs Vue.js and Typescript. It will work on any static web host. 

**Questions & Answers**

 * _How can we know what we estimate? Why can't I set a description / sync with my issue tracker <XYZ>?_ 
 * JokerPoker is meant to be used on a secondary ( mobile ) screen. We assume you use other communication channels like voice and screen sharing in parallel. Your physical estimation poker cards don't show the topic either. [😗](https://en.wikipedia.org/wiki/KISS_principle)

**Don't love it?**

[Change it](https://codeberg.org/culmat/joker-poker/issues), or leave it for an alternative [poker-planning](https://github.com/topics/poker-planning), [planning-poker](https://github.com/topics/planning-poker) or [planningpoker](https://github.com/topics/planningpoker).

**History**

This is a complete rewrite of the [original JokerPoker](https://github.com/culmat/joker-poker).

While the user interface has changed from Vue2/Vuetify to Vue3/NaiveUI the main reason was the move from TogetherJS to YJs as communication layer that should scale much better and fix the [open issues in legacy JokerPoker](https://github.com/culmat/joker-poker/issues).

The main repository and issue tracker is now  [@ Codeberg](https://codeberg.org/culmat/joker-poker/).

## Development

### Running

    npm install
    npm run serve ( you may need export NODE_OPTIONS=--openssl-legacy-provider )

### Building

    npm run package
