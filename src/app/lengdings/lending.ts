import { Allow, BackendMethod, Entity, Field, Fields, getValueList, IdEntity, Remult } from "remult";
import { Item } from "../items/item";
import { Roles } from "../users/roles";
import * as jwt from 'jsonwebtoken';
import { getJwtTokenSignKey } from "../users/user";
import { DataControl, getEntityValueList } from "@remult/angular/interfaces";

@Entity<Lending>("lendings", {
    allowApiCrud: Allow.authenticated,

    defaultOrderBy: { lendDate: "desc" }
}, (options, remult) => {
    if (!remult.isAllowed(Roles.admin)) {
        options.apiPrefilter = { id: remult.user.id }
        options.allowApiUpdate = (remult, lend) => lend!.returnDate == null
    }
}
)
export class Lending extends IdEntity {


    @DataControl({ width: '100' })
    @Fields.string({ caption: 'שם פרטי' })
    firstName = '';
    @DataControl({ width: '100' })
    @Fields.string({ caption: 'שם משפחה' })
    lastName = '';
    @DataControl({ width: '100' })
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

    @DataControl({ width: '100' })
    @Fields.dateOnly({ caption: 'תאריך השאלה', allowApiUpdate: Roles.admin })
    lendDate = new Date();

    @Field(() => Item, { allowApiUpdate: Roles.admin, displayValue: (_, l) => l.name })
    @DataControl({ readonly: true, valueList: async (r: Remult) => getEntityValueList(r.repo(Item)) })
    item!: Item;



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
    @Fields.dateOnly({ allowNull: true, allowApiUpdate: Roles.admin,caption:'תאריך החזרה בפועל' })
    returnDate: Date | null = null;

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
    sendFormInWhatsapp() {
        let message =
            `שלום ${this.firstName}, 
בהקשר להשאלה של ${this.item.name} 

אנא מלא/י את הטופס בקישור הבא:
${window.location.origin + '/form/' + this.id}`;
        this.sendWhatsapp(message);
    }

    sendWhatsapp(message: string) {
        window.open('https://wa.me/' + this.phone + '?text=' + encodeURI(message), '_blank');
    }
}

export function isValidPhone(f: string) {
    return f.replace(/\D/g, '').length == 10;
}