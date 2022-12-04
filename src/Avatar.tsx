import './Avatar.css'

type AvatarProps = {
    name?: string
    source: string
}

export function Avatar({ source, name }: AvatarProps) {
    return (
        <img className="avatar" src={source} alt={'Avatar' + (!!name ? ` for ${name}` : '')}/>
    );
}