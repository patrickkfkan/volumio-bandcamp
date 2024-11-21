import BaseRenderer, { RenderedHeader, RenderedListItem } from './BaseRenderer';
import TagEntity from '../../../../entities/TagEntity';
export default class TagRenderer extends BaseRenderer<TagEntity> {
    renderToListItem(data: TagEntity): RenderedListItem | null;
    renderGenreListItem(data: TagEntity): RenderedListItem | null;
    renderToHeader(data: TagEntity): RenderedHeader | null;
}
//# sourceMappingURL=TagRenderer.d.ts.map