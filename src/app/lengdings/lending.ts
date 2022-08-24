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
            const orig = f.value;
            f.value = orig.replace(/\D/g, '');
            if (f.value.startsWith('972'))
                f.value = '0' + f.value.substr(3);
            else if (orig.trim().startsWith('+'))
                f.value = '+' + f.value;
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
    @Fields.dateOnly({ allowNull: true, allowApiUpdate: Roles.admin, caption: 'תאריך החזרה בפועל' })
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
        let phone = this.phone;
        if (phone.startsWith('0'))
            phone = '972' + phone.substr(1);
        let url = 'https://wa.me/' + phone + '?text=' + encodeURI(message)
        if (isDesktop())
            window.open(url, '_blank');
        else
            window.location.href = url;
    }
}

export function isValidPhone(f: string) {
    return f.replace(/\D/g, '').length == 10;
}

export function isDesktop() {
    const navigatorAgent =
        //@ts-ignore
        navigator.userAgent || navigator.vendor || window.opera;
    return !(
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
            navigatorAgent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
            navigatorAgent.substr(0, 4)
        )
    );
};