import { Entity, Fields, IdEntity } from "remult";
import { Roles } from "../users/roles";


@Entity("items", {
    allowApiCrud: Roles.admin,
    allowApiRead: true,
    defaultOrderBy: { name: "asc" }
})
export class Item extends IdEntity {
    @Fields.string()
    name = '';
    @Fields.integer({ caption: 'ערך פקדון' })
    deposit = 0;
    @Fields.integer({ caption: 'כמות' })
    quantity = 0;
    @Fields.integer<Item>({ caption: 'זמין' }, (options, remult) => {
        options.serverExpression = async (item) =>
            item.quantity - await remult.repo((await import("../lengdings/lending")).Lending).count({ item })
    })
    available = 0;

}

/*
[] make first login set the user and create it as admin.
[] check if same item is loaned to same person and notify
[] block update of returned item for normal people
*/