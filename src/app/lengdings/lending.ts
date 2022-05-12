import { Allow, BackendMethod, Entity, Field, Fields, IdEntity, Remult } from "remult";
import { Item } from "../items/item";
import { Roles } from "../users/roles";
import * as jwt from 'jsonwebtoken';
import { getJwtTokenSignKey } from "../users/user";
import { DataControl } from "@remult/angular/interfaces";

@Entity<Lending>("lendings", {
    allowApiCrud: Allow.authenticated,
    defaultOrderBy: { lendDate: "desc" }
}, (options, remult) => {
    if (!remult.isAllowed(Roles.admin)) {
        options.apiPrefilter = { id: remult.user.id }
    }
}
)
export class Lending extends IdEntity {
    @Field(() => Item, { allowApiUpdate: Roles.admin, displayValue: (_, l) => l.name })
    @DataControl({ readonly: true })
    item!: Item;
    @Fields.dateOnly({ caption: 'תאריך השאלה', allowApiUpdate: Roles.admin })
    lendDate = new Date();
    @Fields.string({
        caption: 'טלפון',
        allowApiUpdate: Roles.admin,
        inputType: 'tel', validate: (_, f) => {
            f.value = f.value.replace(/\D/g, '');
            if (f.value.length < 10)
                throw Error("טלפון לא תקין")
        }
    })
    phone = '';
    @Fields.string({ caption: 'שם פרטי' })
    firstName = '';
    @Fields.string({ caption: 'שם משפחה' })
    lastName = '';
    @Fields.string({ caption: 'כתובת' })
    address = '';
    @Fields.dateOnly({ caption: 'תאריך החזרה משוער' })
    plannedReturnDate: Date = null!;
    @Fields.integer({ caption: 'נמסר פקדון בסך' })
    deposit = 0;
    @Fields.string({ caption: 'אמצעי פקדון' })
    depositType = '';
    @Fields.boolean({ caption: 'מאשר/ת' })
    concent = false;
    @Fields.dateOnly({ allowNull: true, allowApiUpdate: Roles.admin })
    returnDate: Date = null!;

    @BackendMethod({ allowed: true })
    static async formSignIn(id: string, remult?: Remult) {
        let l = await remult!.repo(Lending).findId(id);
        if (!l) {
            throw Error("טופס לא תקין");
        }
        return (jwt.sign({
            id,
            name: l.firstName,
            roles: [Roles.lender]
        }, getJwtTokenSignKey()));
    }
    sendWhatsappToPhone() {
        let phone = this.phone;
        window.open('https://wa.me/' + phone + '?text=' + encodeURI(
            `שלום ${this.firstName}, 
אנא מלא/י את הטופס בקישור הבא בהקשר להשאלה של ${this.item.name}:
${window.location.origin + '/form/' + this.item.id}`
        ), '_blank');
    }
}

export function isValidPhone(f: string) {
    return f.replace(/\D/g, '').length == 10;
}