import {Deployer as EosDeployer} from "./deployer";
import {EventObserver as Listener} from "./listener";

export const Deployer = EosDeployer;
export const DemuxEventListener = Listener;

export type Deployer = EosDeployer;
export type DemuxEventListener = Listener;
