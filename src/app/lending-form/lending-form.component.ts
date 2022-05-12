import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteHelperService } from '@remult/angular';
import { DataAreaSettings } from '@remult/angular/interfaces';
import { Remult } from 'remult';
import { AuthService } from '../auth.service';
import { DialogService } from '../common/dialog';
import { HomeComponent } from '../home/home.component';
import { Lending } from '../lengdings/lending';
import { Roles } from '../users/roles';
import { User } from '../users/user';

@Component({
  selector: 'app-lending-form',
  templateUrl: './lending-form.component.html',
  styleUrls: ['./lending-form.component.scss']
})
export class LendingFormComponent implements OnInit {

  constructor(private remult: Remult,
    private route: ActivatedRoute,
    private auth: AuthService,
    private routeHelper: RouteHelperService,
    private dialog: DialogService) { }
  lending!: Lending;
  area!: DataAreaSettings;
  async ngOnInit() {
    const formId = this.route.snapshot.params['id'];
    if (!this.remult.isAllowed(Roles.admin)) {
      this.auth.setAuthToken(await Lending.formSignIn(formId));
    }
    this.lending = await this.remult.repo(Lending).findId(formId);
    let l = this.lending;
    this.area = new DataAreaSettings({
      fields: () => [
        l.$.firstName,
        l.$.lastName,
        l.$.address,
        l.$.plannedReturnDate,
        l.$.deposit,
        l.$.depositType
      ]
    })

  }
  async confirm() {
    this.lending.concent = true;
    await this.lending.save();
    this.dialog.info("הטופס מולא בהצלחה - איחולי בריאות");
    this.routeHelper.navigateToComponent(HomeComponent);

  }

}
