import { Deployer as EosDeployer } from "./deployer";
import { EventObserver as Listener } from "./listener";
export declare const Deployer: typeof EosDeployer;
export declare const DemuxEventListener: typeof Listener;
export declare type Deployer = EosDeployer;
export declare type DemuxEventListener = Listener;
