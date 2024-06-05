import {LibraryItemID} from "@/models/library.ts";
import {ICstSubstitute} from "@/models/rsform.ts";

export interface ISynthesisData {
    result: LibraryItemID;
    sourceLeft: LibraryItemID;
    sourceRight: LibraryItemID;
    substitutions: ICstSubstitute[];
}