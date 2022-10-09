import { ServerErrorResponse } from '../../../../shared/SocketEvents';
import { SpotifyControllers, ISpotifyContext, Spotify, SpotifyEvents } from './Spotify';
import { TypedEmitter } from 'tiny-typed-emitter';

export const defaultSpotifyControllers: SpotifyControllers = {
    requestLogin: function (authorizationCode: string, redirectUri: string): Promise<true | ServerErrorResponse> {
        throw new Error('Function not implemented.');
    },
    requestRefresh: function (currentData: Spotify): Promise<true | ServerErrorResponse> {
        throw new Error('Function not implemented.');
    },
    logout: function (): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultSpotifyContext: ISpotifyContext = {
    spotify: null,
    controllers: defaultSpotifyControllers,
    events: new TypedEmitter<SpotifyEvents>(),
};
